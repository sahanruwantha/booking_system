.PHONY: dev dev-auth dev-booking dev-notification

dev:
	$(MAKE) dev-auth & $(MAKE) dev-booking & $(MAKE) dev-client

dev-auth:
	cd authentication_service/src && npm run dev

dev-booking:
	cd core_service && npm run dev

dev-client:
	cd client && npm run dev

stop:
	pkill -f nodemon || true

install:
	cd authentication_service && npm install
	cd core_service && npm install
	cd client && npm install 