.PHONY: install test-keys build start test clean-test-keys stop

TEST_KEY := $(shell solana-keygen pubkey ./tests/test-key.json)

all: install test-keys build start test clean-test-keys stop

install:
	yarn install

build:
	anchor build
	yarn idl:generate && yarn lint && yarn build

start:
	solana-test-validator --url https://api.devnet.solana.com \
		--clone metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s --clone PwDiXFxQsGra4sFFTT8r1QWRMd4vfumiWC1jfWNfdYT \
		--clone mgr99QFMYByTqGPWmNqunV7vBLmWWXdSrHUfV8Jf3JM --clone ojLGErfqghuAqpJXE1dguXF7kKfvketCEeah8ig6GU3 \
		--clone pmvYY6Wgvpe3DEj3UX1FcRpMx43sMLYLJrFTVGcqpdn --clone 355AtuHH98Jy9XFg5kWodfmvSfrhcxYUKGoJe8qziFNY \
		--clone auth9SigNpDKz4sJJ1DfCTuZrZNSAgh9sFD3rboVmgg --clone BXPrcDXuxa4G7m5qj4hu9Fs48sAPJqsjK5Y5S8qxH44J \
		--bpf-program stkBL96RZkjY5ine4TvPihGqW8UHJfch2cokjAPzV8i ./target/deploy/cardinal_stake_pool.so \
		--bpf-program rwdNPNPS6zNvtF6FMvaxPRjzu2eC51mXaDT9rmWsojp ./target/deploy/cardinal_reward_distributor.so \
		--bpf-program rrmevmpXMooxn8Qu6u7RWao93BZn4cKgfjtNMURSc2E ./target/deploy/cardinal_receipt_manager.so \
		--bpf-program grwDL1AZiCaBmTQHTQVhX6wxXKowAnisDZxH7866LUL ./target/deploy/cardinal_group_reward_distributor.so \
		--reset --quiet & echo $$!
	sleep 10
	solana-keygen pubkey ./tests/test-key.json
	solana airdrop 1000 $(TEST_KEY) --url http://localhost:8899

test:
	yarn test

stop:
	pkill solana-test-validator