dev:
	NODE_ENV=development ./node_modules/webpack/bin/webpack.js -w

prod:
	NODE_ENV=production ./node_modules/webpack/bin/webpack.js

init_npm:
	npm install --registry=https://registry.npm.taobao.org --verbose

zip:
	rm -rf tiny-todo-list.zip tiny-todo-list-source.zip; \
	make prod; \
	cd ext; \
	zip -r ../tiny-todo-list.zip . -x *.map -x *.DS_Store;

ESLINT_PKG = eslint-config-airbnb
upgrade_eslint:
	npm info '$(ESLINT_PKG)@latest' peerDependencies --json | \
	command sed 's/[\{\},]//g ; s/: /@/g' | \
	xargs yarn add '$(ESLINT_PKG)@latest' -D --save
