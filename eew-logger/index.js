const config = require("../config/config");

class Plugin {
	static instance = null;

	#ctx;
	#config;

	constructor(ctx) {
		if (Plugin.instance) return Plugin.instance;

		this.#ctx = ctx;
		this.#config = null;
		this.config = {};
		this.logger = null;

		Plugin.instance = this;
	}

	static getInstance() {
		if (!Plugin.instance) throw new Error("Plugin not initialized");

		return Plugin.instance;
	}

	onLoad() {
		const { TREM, info, logger, utils } = this.#ctx;

		const defaultDir = utils.path.join(info.pluginDir, "./resource/default.yml");
		const configDir = utils.path.join(info.pluginDir, "./config.yml");

		this.logger = logger;
		this.#config = new config(this.logger, defaultDir, configDir);
		this.config = this.#config.getConfig();

		const args_info_path = utils.path.join(__dirname, "logger");

		if (!utils.fs.existsSync(args_info_path)) utils.fs.mkdirSync(args_info_path);

		function runEEWLogger(ans) {
			const list = utils.fs.readdirSync(args_info_path);
			for (let i = 0; i < list.length; i++) {
				const date = utils.fs.statSync(`${args_info_path}/${list[i]}`);
				if (Date.now() - date.ctimeMs > 86400 * this.config.maximum_storage_day * 1000) utils.fs.unlinkSync(`${args_info_path}/${list[i]}`);
			}

			if (TREM.variable.play_mode == 2 || TREM.variable.play_mode == 3) return;
			utils.fs.writeFileSync(`${args_info_path}/${ans.data.time}.json`, JSON.stringify(ans));
		}

		TREM.variable.events.on("EewRelease", (ans) => runEEWLogger(ans));
		TREM.variable.events.on("EewUpdate", (ans) => runEEWLogger(ans));
		TREM.variable.events.on("EewEnd", (ans) => runEEWLogger(ans));
	}
  }

  module.exports = Plugin;
