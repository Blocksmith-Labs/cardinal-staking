.PHONY: install start test-setup test stop

TEST_KEY := $(shell solana-keygen pubkey ./tests/test-key.json)

all: install start build test stop

install:
	yarn install

start:
	solana-test-validator --url https://api.devnet.solana.com --clone metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s --clone PwDiXFxQsGra4sFFTT8r1QWRMd4vfumiWC1jfWNfdYT --clone mgr99QFMYByTqGPWmNqunV7vBLmWWXdSrHUfV8Jf3JM --clone ojLGErfqghuAqpJXE1dguXF7kKfvketCEeah8ig6GU3 --reset --quiet & echo $$! > validator.PID
	sleep 4
	solana-keygen pubkey ./tests/test-key.json
	solana airdrop 1000 $(TEST_KEY) --url http://localhost:8899

build:
	anchor build
	anchor deploy --provider.cluster localnet

test:
	anchor test --skip-local-validator --skip-build --skip-deploy --provider.cluster localnet

stop: validator.PID
	kill `cat $<` && rm $<