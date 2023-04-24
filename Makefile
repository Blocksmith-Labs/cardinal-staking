.PHONY: install test-keys build start test clean-test-keys stop

TEST_KEY := $(shell solana-keygen pubkey ./tests/test-key.json)

all: install test-keys build start test clean-test-keys stop

install:
	yarn install

test-keys:
	LC_ALL=C find programs src -type f -exec sed -i '' -e "s/47Eamqe6bTbrqSwZwPFTYCQSPxx92E9zw8XTPDz2yHSp/$$(solana-keygen pubkey ./target/deploy/cardinal_stake_pool-keypair.json)/g" {} +
	LC_ALL=C find programs src -type f -exec sed -i '' -e "s/ES6LNgcKLkqD8kemcVBcmuxYzFJxLmQ1BRJ2fAvmX4R8/$$(solana-keygen pubkey ./target/deploy/cardinal_reward_distributor-keypair.json)/g" {} +
	LC_ALL=C find programs src -type f -exec sed -i '' -e "s/4QHcuyATWEoA3E1knztBD6WNSZuCMEKwtRzpQBcwj1Sa/$$(solana-keygen pubkey ./target/deploy/cardinal_receipt_manager-keypair.json)/g" {} +

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
	LC_ALL=C find programs src -type f -exec sed -i '' -e "s/$$(solana-keygen pubkey ./target/deploy/cardinal_stake_pool-keypair.json)/47Eamqe6bTbrqSwZwPFTYCQSPxx92E9zw8XTPDz2yHSp/g" {} +
	LC_ALL=C find programs src -type f -exec sed -i '' -e "s/$$(solana-keygen pubkey ./target/deploy/cardinal_reward_distributor-keypair.json)/ES6LNgcKLkqD8kemcVBcmuxYzFJxLmQ1BRJ2fAvmX4R8/g" {} +
	LC_ALL=C find programs src -type f -exec sed -i '' -e "s/$$(solana-keygen pubkey ./target/deploy/cardinal_receipt_manager-keypair.json)/4QHcuyATWEoA3E1knztBD6WNSZuCMEKwtRzpQBcwj1Sa/g" {} +

stop:
	pkill solana-test-validator