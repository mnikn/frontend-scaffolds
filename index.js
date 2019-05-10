const minimist = require('minimist');
const _ = require('lodash');
const ejs = require('ejs');
const fs = require('fs');

const LANG = {
  TYPESCRIPT: 'typescript',
  JAVASCRIPT : 'javascript',
};
const TYPE = {
  APP: 'app',
	LIB: 'lib',
	THREE_D_GAME: '3dgame',
};
const FRAMEWORK = {
  NONE: 'none',
  REACT: 'react',
};
const ELECTRON = {
  NO: 0,
  YES: 1,
};

function setupDefaultConfigs(args) {
	let configs = _.defaults(args, {
		lang: LANG.TYPESCRIPT,
		type: TYPE.APP,
		framework: FRAMEWORK.NONE,
		electron: ELECTRON.NO,
	});
	configs = _.forEach(configs, (value, key) => {
		configs[key] = _.isString(value) && key !== 'name' ? value.toLocaleLowerCase() : value;
	});
	return configs;
}

function parseTemplate(path, data) {
  const template = fs.readFileSync(path).toString('utf8');
  const content = ejs.render(template, data);
  return content;
}

function createProject(args) {
  const dir = args.name;
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(args.name);
  }
  const srcPath = `${dir}/src`;
  if (!fs.existsSync(srcPath)) {
    fs.mkdirSync(srcPath);
  }
  const publicPath = `${dir}/public`;
  if (!fs.existsSync(publicPath)) {
    fs.mkdirSync(publicPath);
  }

  fs.writeFileSync(`${dir}/package.json`, parseTemplate('./resources/package.ejs', args));
  fs.writeFileSync(`${dir}/.editorconfig`, parseTemplate('./resources/.editorconfig.ejs', args));
	fs.writeFileSync(`${publicPath}/index.html`, parseTemplate('./resources/public/index.ejs', args));  
	
	switch(args.type) {
		case TYPE.THREE_D_GAME:
			fs.writeFileSync(`${dir}/webpack.config.js`, parseTemplate('./resources/webpack.config.ejs', args));
			fs.writeFileSync(`${srcPath}/index`, parseTemplate('./resources/src/game-index.ejs', args));
			break;
		case TYPE.APP:
			fs.writeFileSync(`${dir}/webpack.config.js`, parseTemplate('./resources/webpack.config.ejs', args));
			fs.writeFileSync(`${srcPath}/index`, parseTemplate('./resources/src/app-index.ejs', args));
			break;
	}

	switch(args.lang) {
		case LANG.TYPESCRIPT:
			fs.writeFileSync(`${dir}/tsconfig.json`, parseTemplate('./resources/tsconfig.ejs', args));  
			fs.renameSync(`${srcPath}/index`, `${srcPath}/index.ts`);
			break;
		case LANG.JAVASCRIPT:
			fs.renameSync(`${srcPath}/index`, `${srcPath}/index.js`);
			break;
	}
}

let args = minimist(process.argv.slice(2));
args = setupDefaultConfigs(args);
if (!args.name) {
  console.log('please enter the project name! eg: --name=example ');
  return;
}
createProject(args);
