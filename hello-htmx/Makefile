.PHONY: dev lesson clean

dev:
	node server.mjs

# make lesson N=03
# NOTE: the server must already be running in another terminal via `make dev`
# — this target only prints/opens the URL, it does not start the server.
lesson:
	@file=$$(ls $(N)-*.html 2>/dev/null | head -n1); \
	if [ -z "$$file" ]; then echo "No lesson matching N=$(N)"; exit 1; fi; \
	url="http://localhost:3000/$$file"; \
	echo "$$url"; \
	open "$$url" 2>/dev/null || true

clean:
	# no build artifacts to remove; kept for Makefile convention parity
