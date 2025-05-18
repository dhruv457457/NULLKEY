use starknet::{
    ContractAddress, get_block_number, get_caller_address, get_contract_address,
};
use starknet::storage::{StorageMapReadAccess, StorageMapWriteAccess, Map};
use core::integer::{u64, u32, u256};
use core::num::traits::Zero;
use core::felt252;
use core::pedersen::pedersen;
use core::traits::Into;
use core::array::{ArrayTrait, Array};

#[starknet::interface]
trait IERC721<T> {
    fn transfer_from(ref self: T, from: ContractAddress, to: ContractAddress, token_id: u256);
    fn is_approved_for_all(self: @T, owner: ContractAddress, operator: ContractAddress) -> bool;
}

#[starknet::interface]
trait IERC20<T> {
    fn transfer_from(ref self: T, sender: ContractAddress, recipient: ContractAddress, amount: u256);
    fn balance_of(self: @T, owner: ContractAddress) -> u256;
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
    use core::traits::TryInto;

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        Locked: Locked,
        Unlocked: Unlocked,
        ExpiryExtended: ExpiryExtended,
        LockCancelled: LockCancelled,
    }

    #[derive(Drop, starknet::Event)]
    struct Locked {
        #[key]
        user: ContractAddress,
        #[key]
        lock_id: u32,
        asset_type: u8,
    }

    #[derive(Drop, starknet::Event)]
    struct Unlocked {
        #[key]
        user: ContractAddress,
        #[key]
        lock_id: u32,
    }

    #[derive(Drop, starknet::Event)]
    struct ExpiryExtended {
        #[key]
        user: ContractAddress,
        #[key]
        lock_id: u32,
        extra_blocks: u64,
    }

    #[derive(Drop, starknet::Event)]
    struct LockCancelled {
        #[key]
        user: ContractAddress,
        #[key]
        lock_id: u32,
    }

    #[storage]
    struct Storage {
        locks: Map<(ContractAddress, u32), LockInfo>,
        user_lock_count: Map<ContractAddress, u32>,
        heir_index: Map<ContractAddress, u32>,
        heir_locks: Map<(ContractAddress, u32), (ContractAddress, u32)>,
    }

    #[constructor]
    fn constructor(ref self: ContractState) {}

    #[external(v0)]
    fn lock_nft(
        ref self: ContractState,
        nft: ContractAddress,
        token_id: u256,
        commitment: felt252,
        expiry_blocks: u64,
        cooldown_blocks: u64,
        heir: ContractAddress,
        deadman_blocks: u64,
    ) {
        let caller = get_caller_address();
        assert(!nft.is_zero(), 'Invalid NFT');
        assert(!heir.is_zero(), 'Invalid heir');

        let lock_id = self.user_lock_count.read(caller);
        self.user_lock_count.write(caller, lock_id + 1);

        let block = get_block_number();
        let dispatcher = IERC721Dispatcher { contract_address: nft };
        assert(dispatcher.is_approved_for_all(caller, get_contract_address()), 'Not approved');

        dispatcher.transfer_from(caller, get_contract_address(), token_id);

        let lock = LockInfo {
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
        };
        self.locks.write((caller, lock_id), lock);

        let heir_i = self.heir_index.read(heir);
        self.heir_locks.write((heir, heir_i), (caller, lock_id));
        self.heir_index.write(heir, heir_i + 1);

        self.emit(Event::Locked(Locked { user: caller, lock_id, asset_type: 0 }));
    }

    #[external(v0)]
    fn lock_token(
        ref self: ContractState,
        token: ContractAddress,
        amount: u256,
        commitment: felt252,
        expiry_blocks: u64,
        cooldown_blocks: u64,
        heir: ContractAddress,
        deadman_blocks: u64,
    ) {
        let caller = get_caller_address();
        assert(!token.is_zero(), 'Invalid token');
        assert(!heir.is_zero(), 'Invalid heir');
        assert(amount > 0, 'Invalid amount');

        let lock_id = self.user_lock_count.read(caller);
        self.user_lock_count.write(caller, lock_id + 1);

        let block = get_block_number();
        let dispatcher = IERC20Dispatcher { contract_address: token };
        dispatcher.transfer_from(caller, get_contract_address(), amount);

        let lock = LockInfo {
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
        };
        self.locks.write((caller, lock_id), lock);

        let heir_i = self.heir_index.read(heir);
        self.heir_locks.write((heir, heir_i), (caller, lock_id));
        self.heir_index.write(heir, heir_i + 1);

        self.emit(Event::Locked(Locked { user: caller, lock_id, asset_type: 1 }));
    }

    #[external(v0)]
    fn submit_proof(ref self: ContractState, lock_id: u32, proof: felt252) {
        let caller = get_caller_address();
        let lock = self.locks.read((caller, lock_id));
        assert(!lock.unlocked, 'Already unlocked');

        let now = get_block_number();
        assert(now >= lock.last_attempt_block + lock.cooldown_blocks, 'Cooldown');

        let hashed = pedersen(proof, caller.into());
        if hashed == lock.commitment {
            let updated_lock = LockInfo { unlocked: true, ..lock };
            self.locks.write((caller, lock_id), updated_lock);
            self.emit(Event::Unlocked(Unlocked { user: caller, lock_id }));
        } else {
            let updated_lock = LockInfo {
                failed_attempts: lock.failed_attempts + 1,
                last_attempt_block: now,
                ..lock
            };
            assert(updated_lock.failed_attempts <= 5, 'Too many attempts');
            self.locks.write((caller, lock_id), updated_lock);
        }
    }

    #[external(v0)]
    fn withdraw(ref self: ContractState, lock_id: u32) {
        let caller = get_caller_address();
        let lock = self.locks.read((caller, lock_id));
        assert(lock.unlocked, 'Still locked');
        assert(get_block_number() <= lock.lock_block + lock.expiry_blocks, 'Expired');
        self.clear_lock(caller, lock_id, lock);
    }

    #[external(v0)]
    fn heir_withdraw(ref self: ContractState, user: ContractAddress, lock_id: u32) {
        let caller = get_caller_address();
        let lock = self.locks.read((user, lock_id));
        assert(caller == lock.heir, 'Not heir');
        assert(get_block_number() >= lock.lock_block + lock.deadman_blocks, 'Not yet claimable');
        self.clear_lock(user, lock_id, lock);
    }

    #[external(v0)]
    fn extend_expiry(ref self: ContractState, lock_id: u32, extra_blocks: u64) {
        let caller = get_caller_address();
        let lock = self.locks.read((caller, lock_id));
        assert(!lock.unlocked, 'Already unlocked');
        let updated_lock = LockInfo {
            expiry_blocks: lock.expiry_blocks + extra_blocks,
            ..lock
        };
        self.locks.write((caller, lock_id), updated_lock);
        self.emit(Event::ExpiryExtended(ExpiryExtended { user: caller, lock_id, extra_blocks }));
    }

    #[external(v0)]
    fn cancel_lock(ref self: ContractState, lock_id: u32) {
        let caller = get_caller_address();
        let lock = self.locks.read((caller, lock_id));
        assert(!lock.unlocked, 'Already unlocked');
        self.clear_lock(caller, lock_id, lock);
        self.emit(Event::LockCancelled(LockCancelled { user: caller, lock_id }));
    }

    #[external(v0)]
    fn get_user_locks_paginated(
        self: @ContractState,
        user: ContractAddress,
        start: u32,
        limit: u32
    ) -> Array<LockInfo> {
        let mut arr: Array<LockInfo> = ArrayTrait::new();
        let count = self.user_lock_count.read(user);

        let mut i = start;
        let end = if count < start + limit { count } else { start + limit };
        while i < end {
            arr.append(self.locks.read((user, i)));
            i += 1;
        }
        arr
    }

    #[external(v0)]
    fn get_claimable_by_heir(self: @ContractState, heir: ContractAddress) -> Array<(ContractAddress, u32)> {
        let mut res: Array<(ContractAddress, u32)> = ArrayTrait::new();
        let now = get_block_number();
        let len = self.heir_index.read(heir);
        let mut i = 0;
        while i < len {
            let (user, lock_id) = self.heir_locks.read((heir, i));
            let lock = self.locks.read((user, lock_id));
            if !lock.unlocked && now >= lock.lock_block + lock.deadman_blocks {
                res.append((user, lock_id));
            }
            i += 1;
        }
        res
    }

    // ✅ NEW: Get total locks of a user
    #[external(v0)]
    fn get_lock_count(self: @ContractState, user: ContractAddress) -> u32 {
        self.user_lock_count.read(user)
    }

    #[generate_trait]
    impl InternalFunctions of InternalTrait {
        fn clear_lock(ref self: ContractState, user: ContractAddress, lock_id: u32, lock: LockInfo) {
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

            let empty_lock = LockInfo {
                asset_type: lock.asset_type,
                token_contract: 0.try_into().unwrap(),
                token_id: u256 { low: 0, high: 0 },
                amount: u256 { low: 0, high: 0 },
                commitment: 0,
                unlocked: false,
                failed_attempts: 0,
                last_attempt_block: 0,
                cooldown_blocks: 0,
                lock_block: 0,
                expiry_blocks: 0,
                heir: 0.try_into().unwrap(),
                deadman_blocks: 0,
            };
            self.locks.write((user, lock_id), empty_lock);
        }
    }
}
