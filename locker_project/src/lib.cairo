use starknet::ContractAddress;

#[starknet::interface]
trait NullKeyTrait<TContractState> {
    fn get_lock_info(self: @TContractState) -> (ContractAddress, u256, bool, u32, u64);
    fn submit_proof(ref self: TContractState, proof: felt252);
    fn guardian_unlock(ref self: TContractState);
    fn withdraw(ref self: TContractState);
    fn set_guardians(ref self: TContractState, g1: ContractAddress, g2: ContractAddress);
}

#[starknet::contract]
mod NullKey {
    use starknet::{ContractAddress, get_block_number, get_caller_address};
    use starknet::storage::{StoragePointerReadAccess, StoragePointerWriteAccess};
    use core::integer::{u256, u32, u64};
    use core::felt252;
    use core::traits::TryInto; // Added for try_into
    use core::option::OptionTrait; // Added for unwrap

    #[derive(starknet::Event, Drop)]
    struct ProofSubmitted {
        success: felt252
    }

    #[derive(starknet::Event, Drop)]
    struct AssetUnlocked {
        owner: ContractAddress
    }

    #[event]
    #[derive(starknet::Event, Drop)]
    enum Event {
        ProofSubmitted: ProofSubmitted,
        AssetUnlocked: AssetUnlocked
    }

    #[starknet::interface]
    trait IERC721<T> {
        fn transfer_from(ref self: T, from: ContractAddress, to: ContractAddress, token_id: u256);
    }

    #[storage]
    struct Storage {
        dummy: u8,
        owner: ContractAddress,
        nft_contract: ContractAddress,
        token_id: u256,
        commitment: felt252,
        unlocked: bool,
        failed_attempts: u32,
        last_attempt_block: u64,
        cooldown_blocks: u64,
        lock_block: u64,
        expiry_blocks: u64,
        guardian1: ContractAddress,
        guardian2: ContractAddress,
        guardian_votes: u8,
    }

    #[constructor]
    fn constructor(
        ref self: ContractState,
        nft_contract: ContractAddress,
        token_id: u256,
        commitment: felt252,
        expiry_blocks: u64,
        cooldown_blocks: u64
    ) {
        let caller = get_caller_address();

        assert(nft_contract != 0.try_into().unwrap(), 'Invalid NFT contract');
        assert(expiry_blocks > 0, 'Invalid expiry blocks');
        assert(cooldown_blocks > 0, 'Invalid cooldown blocks');

        self.owner.write(caller);
        self.nft_contract.write(nft_contract);
        self.token_id.write(token_id);
        self.commitment.write(commitment);
        self.unlocked.write(false);
        self.failed_attempts.write(0);
        self.lock_block.write(get_block_number());
        self.expiry_blocks.write(expiry_blocks);
        self.cooldown_blocks.write(cooldown_blocks);
        self.last_attempt_block.write(get_block_number());
        self.guardian1.write(0.try_into().unwrap());
        self.guardian2.write(0.try_into().unwrap());
        self.guardian_votes.write(0);
    }

    #[abi(embed_v0)]
    impl NullKeyImpl of super::NullKeyTrait<ContractState> {
        fn get_lock_info(self: @ContractState) -> (ContractAddress, u256, bool, u32, u64) {
            (
                self.nft_contract.read(),
                self.token_id.read(),
                self.unlocked.read(),
                self.failed_attempts.read(),
                self.lock_block.read()
            )
        }

        fn submit_proof(ref self: ContractState, proof: felt252) {
            let current_block = get_block_number();
            let last_block = self.last_attempt_block.read();
            let cooldown = self.cooldown_blocks.read();

            assert(current_block >= last_block + cooldown, 'Try again later');
            self.last_attempt_block.write(current_block);

            if self.commitment.read() == proof {
                self.unlocked.write(true);
                self.emit(Event::AssetUnlocked(AssetUnlocked { owner: self.owner.read() }));
                self.emit(Event::ProofSubmitted(ProofSubmitted { success: 1 }));
            } else {
                let failures = self.failed_attempts.read();
                self.failed_attempts.write(failures + 1);
                self.emit(Event::ProofSubmitted(ProofSubmitted { success: 0 }));
            }
        }

        fn guardian_unlock(ref self: ContractState) {
            let caller = get_caller_address();
            assert(caller == self.guardian1.read() || caller == self.guardian2.read(), 'Not a guardian');
            assert(!self.unlocked.read(), 'Already unlocked');

            let votes = self.guardian_votes.read();
            assert(votes < 2_u8, 'Max votes reached');

            self.guardian_votes.write(votes + 1);
            if votes + 1 >= 2_u8 {
                self.unlocked.write(true);
                self.emit(Event::AssetUnlocked(AssetUnlocked { owner: self.owner.read() }));
            }
        }

        fn withdraw(ref self: ContractState) {
            assert(self.unlocked.read(), 'Asset still locked');
            let current_block = get_block_number();
            let expiry = self.expiry_blocks.read();
            let lock_block = self.lock_block.read();

            assert(current_block <= lock_block + expiry, 'Lock expired');

            let nft = IERC721Dispatcher { contract_address: self.nft_contract.read() };
            nft.transfer_from(self.owner.read(), self.owner.read(), self.token_id.read());

            self.unlocked.write(false);
            self.guardian_votes.write(0);
        }

        fn set_guardians(ref self: ContractState, g1: ContractAddress, g2: ContractAddress) {
            let caller = get_caller_address();
            assert(caller == self.owner.read(), 'Only owner can set guardians');
            self.guardian1.write(g1);
            self.guardian2.write(g2);
            self.guardian_votes.write(0);
        }
    }
}