.PHONY: install test-keys build start test clean-test-keys stop

TEST_KEY := $(shell solana-keygen pubkey ./tests/test-key.json)

all: install test-keys build start test clean-test-keys stop

install:
	yarn install

test-keys:
	LC_ALL=C find programs src -type f -exec sed -i '' -e "s/J7UH6Lj7JDhRqEgMipbAyjkXWMdUoD5e36EFLJt6Md14/$$(solana-keygen pubkey ./target/deploy/cardinal_stake_pool-keypair.json)/g" {} +
	LC_ALL=C find programs src -type f -exec sed -i '' -e "s/CAycEuE9Krg5rPkRDKyWsMPJVJgNFm1tcGPXv8v6foPk/$$(solana-keygen pubkey ./target/deploy/cardinal_reward_distributor-keypair.json)/g" {} +
	LC_ALL=C find programs src -type f -exec sed -i '' -e "s/GgKDqv8FdwCfgStTnwuYNjifTGJ2wffhNoknn1UJ2sve/$$(solana-keygen pubkey ./target/deploy/cardinal_receipt_manager-keypair.json)/g" {} +

build:
	anchor build
	yarn idl:generate

start:
	solana-test-validator --url https://api.devnet.solana.com \
		--clone metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s --clone PwDiXFxQsGra4sFFTT8r1QWRMd4vfumiWC1jfWNfdYT \
		--clone mgr99QFMYByTqGPWmNqunV7vBLmWWXdSrHUfV8Jf3JM --clone ojLGErfqghuAqpJXE1dguXF7kKfvketCEeah8ig6GU3 \
		--clone pmvYY6Wgvpe3DEj3UX1FcRpMx43sMLYLJrFTVGcqpdn --clone 355AtuHH98Jy9XFg5kWodfmvSfrhcxYUKGoJe8qziFNY \
		--bpf-program ./target/deploy/cardinal_stake_pool-keypair.json ./target/deploy/cardinal_stake_pool.so \
		--bpf-program ./target/deploy/cardinal_reward_distributor-keypair.json ./target/deploy/cardinal_reward_distributor.so \
		--bpf-program ./target/deploy/cardinal_receipt_manager-keypair.json ./target/deploy/cardinal_receipt_manager.so \
		--reset --quiet & echo $$!
	sleep 10
	solana-keygen pubkey ./tests/test-key.json
	solana airdrop 1000 $(TEST_KEY) --url http://localhost:8899

test:
	anchor test --skip-local-validator --skip-build --skip-deploy --provider.cluster localnet

clean-test-keys:
	LC_ALL=C find programs src -type f -exec sed -i '' -e "s/$$(solana-keygen pubkey ./target/deploy/cardinal_stake_pool-keypair.json)/J7UH6Lj7JDhRqEgMipbAyjkXWMdUoD5e36EFLJt6Md14/g" {} +
	LC_ALL=C find programs src -type f -exec sed -i '' -e "s/$$(solana-keygen pubkey ./target/deploy/cardinal_reward_distributor-keypair.json)/CAycEuE9Krg5rPkRDKyWsMPJVJgNFm1tcGPXv8v6foPk/g" {} +
	LC_ALL=C find programs src -type f -exec sed -i '' -e "s/$$(solana-keygen pubkey ./target/deploy/cardinal_receipt_manager-keypair.json)/GgKDqv8FdwCfgStTnwuYNjifTGJ2wffhNoknn1UJ2sve/g" {} +

stop:
	pkill solana-test-validator