.PHONY: setup down clean logs

setup:
	@cp -n .env.example .env 2>/dev/null || true
	docker compose up -d

down:
	docker compose down

clean:
	docker compose down -v

logs:
	docker compose logs -f
