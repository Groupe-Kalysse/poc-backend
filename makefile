.PHONY: stop clean prune dev

stop:
	docker stop $(shell docker ps -a -q)

clean:
	sudo rm -rf persist/ /run/pcscd/pcscd.comm

prune:
	docker system prune -af --volumes

dev: 
	docker compose --env-file .env.dev -f compose.dev.yaml up -d --build

