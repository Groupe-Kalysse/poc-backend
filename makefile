.PHONY: stop clean enter dev

stop:
	docker stop $(shell docker ps -a -q)

clean:
	docker system prune -af --volumes && sudo rm -rf persist/

enter:
	docker exec -it $(target) sh

dev: 
	docker compose --env-file .env.dev -f compose.dev.yaml up -d

