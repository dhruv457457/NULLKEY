use starknet::{ContractAddress, get_block_number, get_caller_address, get_contract_address};
use starknet::storage::{Map, StorageMapReadAccess, StorageMapWriteAccess};
use core::integer::{u64, u32, u256};
use core::felt252;
use core::pedersen::pedersen;
use core::num::traits::Zero;
use core::traits::TryInto;

#[starknet::interface]
trait IERC721<TContractState> {
    fn transfer_from(ref self: TContractState, from: ContractAddress, to: ContractAddress, token_id: u256);
    fn is_approved_for_all(self: @TContractState, owner: ContractAddress, operator: ContractAddress) -> bool;
}

#[starknet::interface]
trait IERC20<TContractState> {
    fn transfer_from(ref self: TContractState, sender: ContractAddress, recipient: ContractAddress, amount: u256);
    fn balance_of(self: @TContractState, owner: ContractAddress) -> u256;
}

#[starknet::interface]
trait INullKeyVault<TContractState> {
    fn lock_nft(
        ref self: TContractState,
        nft: ContractAddress,
        token_id: u256,
        commitment: felt252,
        expiry_blocks: u64,
        cooldown_blocks: u64,
        heir: ContractAddress,
        deadman_blocks: u64
    );
    fn lock_token(
        ref self: TContractState,
        token: ContractAddress,
        amount: u256,
        commitment: felt252,
        expiry_blocks: u64,
        cooldown_blocks: u64,
        heir: ContractAddress,
        deadman_blocks: u64
    );
    fn submit_proof(ref self: TContractState, lock_id: u32, proof: felt252);
    fn withdraw(ref self: TContractState, lock_id: u32);
    fn heir_withdraw(ref self: TContractState, user: ContractAddress, lock_id: u32);
    fn get_lock_info(self: @TContractState, user: ContractAddress, lock_id: u32) -> LockInfo;
    fn get_user_lock_count(self: @TContractState, user: ContractAddress) -> u32;
}

#[derive(Copy, Drop, Serde, starknet::Store)]
#[allow(starknet::store_no_default_variant)]
enum AssetType {
    NFT,
    Token,
}

#[derive(Copy, Drop, Serde, starknet::Store)]
struct LockInfo {
    asset_type: AssetType,
    token_contract: ContractAddress,
    token_id: u256,
    amount: u256,
    commitment: felt252,
    unlocked: bool,
    failed_attempts: u32,
    last_attempt_block: u64,
    cooldown_blocks: u64,
    lock_block: u64,
    expiry_blocks: u64,
    heir: ContractAddress,
    deadman_blocks: u64,
}

#[starknet::contract]
mod NullKeyVault {
    use super::*;

    #[derive(Drop, starknet::Event)]
    struct Locked {
        user: ContractAddress,
        lock_id: u32,
        asset_type: AssetType,
    }

    #[derive(Drop, starknet::Event)]
    struct Unlocked {
        user: ContractAddress,
        lock_id: u32,
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        Locked: Locked,
        Unlocked: Unlocked,
    }

    #[storage]
    struct Storage {
        locks: Map<(ContractAddress, u32), LockInfo>,
        user_lock_count: Map<ContractAddress, u32>,
    }

    #[constructor]
    fn constructor(ref self: ContractState) {
        // no-op
    }

    #[abi(embed_v0)]
    impl NullKeyVaultImpl of super::INullKeyVault<ContractState> {
        fn lock_nft(
            ref self: ContractState,
            nft: ContractAddress,
            token_id: u256,
            commitment: felt252,
            expiry_blocks: u64,
            cooldown_blocks: u64,
            heir: ContractAddress,
            deadman_blocks: u64
        ) {
            let caller = get_caller_address();
            assert(commitment != 0, 'Invalid commitment');
            assert(expiry_blocks > 0, 'Invalid expiry');
            assert(cooldown_blocks > 0, 'Invalid cooldown');

            let dispatcher = IERC721Dispatcher { contract_address: nft };
            assert(dispatcher.is_approved_for_all(caller, get_contract_address()), 'Not approved');
            dispatcher.transfer_from(caller, get_contract_address(), token_id);

            let block = get_block_number();
            let lock_id = self.user_lock_count.read(caller);
            self.user_lock_count.write(caller, lock_id + 1);

            self.locks.write((caller, lock_id), LockInfo {
                asset_type: AssetType::NFT,
                token_contract: nft,
                token_id,
                amount: u256 { low: 0, high: 0 },
                commitment,
                unlocked: false,
                failed_attempts: 0,
                last_attempt_block: block,
                cooldown_blocks,
                lock_block: block,
                expiry_blocks,
                heir,
                deadman_blocks,
            });

            self.emit(Event::Locked(Locked { user: caller, lock_id, asset_type: AssetType::NFT }));
        }

        fn lock_token(
            ref self: ContractState,
            token: ContractAddress,
            amount: u256,
            commitment: felt252,
            expiry_blocks: u64,
            cooldown_blocks: u64,
            heir: ContractAddress,
            deadman_blocks: u64
        ) {
            let caller = get_caller_address();
            assert(commitment != 0, 'Invalid commitment');
            assert(expiry_blocks > 0, 'Invalid expiry');
            assert(cooldown_blocks > 0, 'Invalid cooldown');

            let dispatcher = IERC20Dispatcher { contract_address: token };
            dispatcher.transfer_from(caller, get_contract_address(), amount);

            let block = get_block_number();
            let lock_id = self.user_lock_count.read(caller);
            self.user_lock_count.write(caller, lock_id + 1);

            self.locks.write((caller, lock_id), LockInfo {
                asset_type: AssetType::Token,
                token_contract: token,
                token_id: u256 { low: 0, high: 0 },
                amount,
                commitment,
                unlocked: false,
                failed_attempts: 0,
                last_attempt_block: block,
                cooldown_blocks,
                lock_block: block,
                expiry_blocks,
                heir,
                deadman_blocks,
            });

            self.emit(Event::Locked(Locked { user: caller, lock_id, asset_type: AssetType::Token }));
        }

        fn submit_proof(ref self: ContractState, lock_id: u32, proof: felt252) {
            let caller = get_caller_address();
            let mut lock = self.locks.read((caller, lock_id));
            
            // Verify lock exists
            assert(!lock.token_contract.is_zero(), 'Lock not found');
            assert(!lock.unlocked, 'Already unlocked');

            let now = get_block_number();
            assert(now >= lock.last_attempt_block + lock.cooldown_blocks, 'Cooldown');

            let hashed = pedersen(proof, 0);
            if hashed == lock.commitment {
                lock.unlocked = true;
                self.emit(Event::Unlocked(Unlocked { user: caller, lock_id }));
            } else {
                lock.failed_attempts += 1;
                assert(lock.failed_attempts <= 5, 'Too many attempts');
            }

            lock.last_attempt_block = now;
            self.locks.write((caller, lock_id), lock);
        }

        fn withdraw(ref self: ContractState, lock_id: u32) {
            let caller = get_caller_address();
            let lock = self.locks.read((caller, lock_id));
            
            // Verify lock exists
            assert(!lock.token_contract.is_zero(), 'Lock not found');
            assert(lock.unlocked, 'Still locked');

            let now = get_block_number();
            assert(now <= lock.lock_block + lock.expiry_blocks, 'Lock expired');

            self.clear_lock(caller, lock_id, lock);
        }

        fn heir_withdraw(ref self: ContractState, user: ContractAddress, lock_id: u32) {
            let caller = get_caller_address();
            let lock = self.locks.read((user, lock_id));
            
            // Verify lock exists
            assert(!lock.token_contract.is_zero(), 'Lock not found');
            assert(caller == lock.heir, 'Not heir');

            let now = get_block_number();
            assert(now >= lock.lock_block + lock.deadman_blocks, 'Not yet claimable');

            self.clear_lock(user, lock_id, lock);
        }

        fn get_lock_info(self: @ContractState, user: ContractAddress, lock_id: u32) -> LockInfo {
            let lock = self.locks.read((user, lock_id));
            assert(!lock.token_contract.is_zero(), 'Not locked');
            lock
        }

        fn get_user_lock_count(self: @ContractState, user: ContractAddress) -> u32 {
            self.user_lock_count.read(user)
        }
    }

    #[generate_trait]
    impl InternalFunctions of InternalTrait {
        fn clear_lock(
            ref self: ContractState,
            user: ContractAddress,
            lock_id: u32,
            lock: LockInfo
        ) {
            // Transfer the asset first, then clear the lock
            match lock.asset_type {
                AssetType::NFT => {
                    let nft = IERC721Dispatcher { contract_address: lock.token_contract };
                    nft.transfer_from(get_contract_address(), user, lock.token_id);
                },
                AssetType::Token => {
                    let erc20 = IERC20Dispatcher { contract_address: lock.token_contract };
                    erc20.transfer_from(get_contract_address(), user, lock.amount);
                },
            }

            // Clear lock data
            self.locks.write((user, lock_id), LockInfo {
                asset_type: lock.asset_type,
                token_contract: 0.try_into().unwrap(),
                token_id: u256 { low: 0, high: 0 },
                amount: u256 { low: 0, high: 0 },
                commitment: 0.try_into().unwrap(),
                unlocked: false,
                failed_attempts: 0,
                last_attempt_block: 0,
                cooldown_blocks: 0,
                lock_block: 0,
                expiry_blocks: 0,
                heir: 0.try_into().unwrap(),
                deadman_blocks: 0,
            });
        }
    }
}