"use strict";
// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const ajv_1 = __importDefault(require("ajv"));
const json = __importStar(require("comment-json"));
const algorithm_1 = require("@phosphor/algorithm");
const coreutils_1 = require("@phosphor/coreutils");
const signaling_1 = require("@phosphor/signaling");
/**
 * The key in the schema for setting editor icon class hints.
 */
exports.ICON_CLASS_KEY = 'jupyter.lab.setting-icon-class';
/**
 * The key in the schema for setting editor icon label hints.
 */
exports.ICON_LABEL_KEY = 'jupyter.lab.setting-icon-label';
/**
 * An alias for the JSON deep copy function.
 */
const copy = coreutils_1.JSONExt.deepCopy;
/* tslint:disable */
/**
 * The setting registry token.
 */
exports.ISettingRegistry = new coreutils_1.Token('@jupyterlab/coreutils:ISettingRegistry');
/**
 * The default implementation of a schema validator.
 */
class DefaultSchemaValidator {
    /**
     * Instantiate a schema validator.
     */
    constructor() {
        this._composer = new ajv_1.default({ useDefaults: true });
        this._validator = new ajv_1.default();
        this._composer.addSchema(Private.SCHEMA, 'main');
        this._validator.addSchema(Private.SCHEMA, 'main');
    }
    /**
     * Validate a plugin's schema and user data; populate the `composite` data.
     *
     * @param plugin - The plugin being validated. Its `composite` data will be
     * populated by reference.
     *
     * @param populate - Whether plugin data should be populated, defaults to
     * `true`.
     *
     * @return A list of errors if either the schema or data fail to validate or
     * `null` if there are no errors.
     */
    validateData(plugin, populate = true) {
        const validate = this._validator.getSchema(plugin.id);
        const compose = this._composer.getSchema(plugin.id);
        // If the schemas do not exist, add them to the validator and continue.
        if (!validate || !compose) {
            const errors = this._addSchema(plugin.id, plugin.schema);
            if (errors) {
                return errors;
            }
            return this.validateData(plugin);
        }
        // Parse the raw commented JSON into a user map.
        let user;
        try {
            const strip = true;
            user = json.parse(plugin.raw, null, strip);
        }
        catch (error) {
            if (error instanceof SyntaxError) {
                return [
                    {
                        dataPath: '',
                        keyword: 'syntax',
                        schemaPath: '',
                        message: error.message
                    }
                ];
            }
            const { column, description } = error;
            const line = error.lineNumber;
            return [
                {
                    dataPath: '',
                    keyword: 'parse',
                    schemaPath: '',
                    message: `${description} (line ${line} column ${column})`
                }
            ];
        }
        if (!validate(user)) {
            return validate.errors;
        }
        // Copy the user data before merging defaults into composite map.
        const composite = copy(user);
        if (!compose(composite)) {
            return compose.errors;
        }
        if (populate) {
            plugin.data = { composite, user };
        }
        return null;
    }
    /**
     * Add a schema to the validator.
     *
     * @param plugin - The plugin ID.
     *
     * @param schema - The schema being added.
     *
     * @return A list of errors if the schema fails to validate or `null` if there
     * are no errors.
     *
     * #### Notes
     * It is safe to call this function multiple times with the same plugin name.
     */
    _addSchema(plugin, schema) {
        const composer = this._composer;
        const validator = this._validator;
        const validate = validator.getSchema('main');
        // Validate against the main schema.
        if (!validate(schema)) {
            return validate.errors;
        }
        // Validate against the JSON schema meta-schema.
        if (!validator.validateSchema(schema)) {
            return validator.errors;
        }
        // Remove if schema already exists.
        composer.removeSchema(plugin);
        validator.removeSchema(plugin);
        // Add schema to the validator and composer.
        composer.addSchema(schema, plugin);
        validator.addSchema(schema, plugin);
        return null;
    }
}
exports.DefaultSchemaValidator = DefaultSchemaValidator;
/**
 * The default concrete implementation of a setting registry.
 */
class SettingRegistry {
    /**
     * Create a new setting registry.
     */
    constructor(options) {
        /**
         * The schema of the setting registry.
         */
        this.schema = Private.SCHEMA;
        this._pluginChanged = new signaling_1.Signal(this);
        this._plugins = Object.create(null);
        this._connector = options.connector;
        this.validator = options.validator || new DefaultSchemaValidator();
    }
    /**
     * A signal that emits the name of a plugin when its settings change.
     */
    get pluginChanged() {
        return this._pluginChanged;
    }
    /**
     * Returns a list of plugin settings held in the registry.
     */
    get plugins() {
        const plugins = this._plugins;
        return Object.keys(plugins).map(p => copy(plugins[p]));
    }
    /**
     * Get an individual setting.
     *
     * @param plugin - The name of the plugin whose settings are being retrieved.
     *
     * @param key - The name of the setting being retrieved.
     *
     * @returns A promise that resolves when the setting is retrieved.
     */
    get(plugin, key) {
        const plugins = this._plugins;
        if (plugin in plugins) {
            const { composite, user } = plugins[plugin].data;
            const result = {
                composite: key in composite ? copy(composite[key]) : undefined,
                user: key in user ? copy(user[key]) : undefined
            };
            return Promise.resolve(result);
        }
        return this.load(plugin).then(() => this.get(plugin, key));
    }
    /**
     * Load a plugin's settings into the setting registry.
     *
     * @param plugin - The name of the plugin whose settings are being loaded.
     *
     * @returns A promise that resolves with a plugin settings object or rejects
     * if the plugin is not found.
     */
    load(plugin) {
        const plugins = this._plugins;
        const registry = this;
        // If the plugin exists, resolve.
        if (plugin in plugins) {
            const settings = new Settings({ plugin: plugins[plugin], registry });
            return Promise.resolve(settings);
        }
        // If the plugin needs to be loaded from the data connector, fetch.
        return this.reload(plugin);
    }
    /**
     * Reload a plugin's settings into the registry even if they already exist.
     *
     * @param plugin - The name of the plugin whose settings are being reloaded.
     *
     * @returns A promise that resolves with a plugin settings object or rejects
     * with a list of `ISchemaValidator.IError` objects if it fails.
     */
    reload(plugin) {
        const connector = this._connector;
        const plugins = this._plugins;
        const registry = this;
        // If the plugin needs to be loaded from the connector, fetch.
        return connector.fetch(plugin).then(data => {
            // Validate the response from the connector; populate `composite` field.
            try {
                this._validate(data);
            }
            catch (errors) {
                const output = [`Validating ${plugin} failed:`];
                errors.forEach((error, index) => {
                    const { dataPath, schemaPath, keyword, message } = error;
                    output.push(`${index} - schema @ ${schemaPath}, data @ ${dataPath}`);
                    output.push(`\t${keyword} ${message}`);
                });
                console.error(output.join('\n'));
                throw new Error(`Failed validating ${plugin}`);
            }
            // Emit that a plugin has changed.
            this._pluginChanged.emit(plugin);
            return new Settings({ plugin: plugins[plugin], registry });
        });
    }
    /**
     * Remove a single setting in the registry.
     *
     * @param plugin - The name of the plugin whose setting is being removed.
     *
     * @param key - The name of the setting being removed.
     *
     * @returns A promise that resolves when the setting is removed.
     */
    remove(plugin, key) {
        const plugins = this._plugins;
        if (!(plugin in plugins)) {
            return Promise.resolve(undefined);
        }
        const raw = json.parse(plugins[plugin].raw, null, true);
        // Delete both the value and any associated comment.
        delete raw[key];
        delete raw[`// ${key}`];
        plugins[plugin].raw = Private.annotatedPlugin(plugins[plugin], raw);
        return this._save(plugin);
    }
    /**
     * Set a single setting in the registry.
     *
     * @param plugin - The name of the plugin whose setting is being set.
     *
     * @param key - The name of the setting being set.
     *
     * @param value - The value of the setting being set.
     *
     * @returns A promise that resolves when the setting has been saved.
     *
     */
    set(plugin, key, value) {
        const plugins = this._plugins;
        if (!(plugin in plugins)) {
            return this.load(plugin).then(() => this.set(plugin, key, value));
        }
        const raw = json.parse(plugins[plugin].raw, null, true);
        plugins[plugin].raw = Private.annotatedPlugin(plugins[plugin], Object.assign({}, raw, { [key]: value }));
        return this._save(plugin);
    }
    /**
     * Upload a plugin's settings.
     *
     * @param plugin - The name of the plugin whose settings are being set.
     *
     * @param raw - The raw plugin settings being uploaded.
     *
     * @returns A promise that resolves when the settings have been saved.
     */
    upload(plugin, raw) {
        const plugins = this._plugins;
        if (!(plugin in plugins)) {
            return this.load(plugin).then(() => this.upload(plugin, raw));
        }
        // Set the local copy.
        plugins[plugin].raw = raw;
        return this._save(plugin);
    }
    /**
     * Save a plugin in the registry.
     */
    _save(plugin) {
        const plugins = this._plugins;
        if (!(plugin in plugins)) {
            const message = `${plugin} does not exist in setting registry.`;
            return Promise.reject(new Error(message));
        }
        try {
            this._validate(plugins[plugin]);
        }
        catch (errors) {
            const message = `${plugin} failed to validate; check console for errors.`;
            console.warn(`${plugin} validation errors:`, errors);
            return Promise.reject(new Error(message));
        }
        return this._connector.save(plugin, plugins[plugin].raw).then(() => {
            this._pluginChanged.emit(plugin);
        });
    }
    /**
     * Validate a plugin's data and schema, compose the `composite` data.
     */
    _validate(plugin) {
        // Validate the user data and create the composite data.
        const errors = this.validator.validateData(plugin);
        if (errors) {
            throw errors;
        }
        // Set the local copy.
        this._plugins[plugin.id] = plugin;
    }
}
exports.SettingRegistry = SettingRegistry;
/**
 * A manager for a specific plugin's settings.
 */
class Settings {
    /**
     * Instantiate a new plugin settings manager.
     */
    constructor(options) {
        this._changed = new signaling_1.Signal(this);
        this._composite = Object.create(null);
        this._isDisposed = false;
        this._raw = '{ }';
        this._schema = Object.create(null);
        this._user = Object.create(null);
        const { plugin } = options;
        this.plugin = plugin.id;
        this.registry = options.registry;
        this._composite = plugin.data.composite || {};
        this._raw = plugin.raw || '{ }';
        this._schema = plugin.schema || { type: 'object' };
        this._user = plugin.data.user || {};
        this.registry.pluginChanged.connect(this._onPluginChanged, this);
    }
    /**
     * A signal that emits when the plugin's settings have changed.
     */
    get changed() {
        return this._changed;
    }
    /**
     * Get the composite of user settings and extension defaults.
     */
    get composite() {
        return this._composite;
    }
    /**
     * Test whether the plugin settings manager disposed.
     */
    get isDisposed() {
        return this._isDisposed;
    }
    /**
     * Get the plugin settings schema.
     */
    get schema() {
        return this._schema;
    }
    /**
     * Get the plugin settings raw text value.
     */
    get raw() {
        return this._raw;
    }
    /**
     * Get the user settings.
     */
    get user() {
        return this._user;
    }
    /**
     * Return the defaults in a commented JSON format.
     */
    annotatedDefaults() {
        return Private.annotatedDefaults(this._schema, this.plugin);
    }
    /**
     * Calculate the default value of a setting by iterating through the schema.
     *
     * @param key - The name of the setting whose default value is calculated.
     *
     * @returns A calculated default JSON value for a specific setting.
     */
    default(key) {
        return Private.reifyDefault(this.schema, key);
    }
    /**
     * Dispose of the plugin settings resources.
     */
    dispose() {
        if (this._isDisposed) {
            return;
        }
        this._isDisposed = true;
        signaling_1.Signal.clearData(this);
    }
    /**
     * Get an individual setting.
     *
     * @param key - The name of the setting being retrieved.
     *
     * @returns The setting value.
     *
     * #### Notes
     * This method returns synchronously because it uses a cached copy of the
     * plugin settings that is synchronized with the registry.
     */
    get(key) {
        const { composite, user } = this;
        return {
            composite: key in composite ? copy(composite[key]) : undefined,
            user: key in user ? copy(user[key]) : undefined
        };
    }
    /**
     * Remove a single setting.
     *
     * @param key - The name of the setting being removed.
     *
     * @returns A promise that resolves when the setting is removed.
     *
     * #### Notes
     * This function is asynchronous because it writes to the setting registry.
     */
    remove(key) {
        return this.registry.remove(this.plugin, key);
    }
    /**
     * Save all of the plugin's user settings at once.
     */
    save(raw) {
        return this.registry.upload(this.plugin, raw);
    }
    /**
     * Set a single setting.
     *
     * @param key - The name of the setting being set.
     *
     * @param value - The value of the setting.
     *
     * @returns A promise that resolves when the setting has been saved.
     *
     * #### Notes
     * This function is asynchronous because it writes to the setting registry.
     */
    set(key, value) {
        return this.registry.set(this.plugin, key, value);
    }
    /**
     * Validates raw settings with comments.
     *
     * @param raw - The JSON with comments string being validated.
     *
     * @returns A list of errors or `null` if valid.
     */
    validate(raw) {
        const data = { composite: {}, user: {} };
        const id = this.plugin;
        const schema = this._schema;
        const validator = this.registry.validator;
        return validator.validateData({ data, id, raw, schema }, false);
    }
    /**
     * Handle plugin changes in the setting registry.
     */
    _onPluginChanged(sender, plugin) {
        if (plugin === this.plugin) {
            const found = algorithm_1.find(this.registry.plugins, p => p.id === plugin);
            if (!found) {
                return;
            }
            const { composite, user } = found.data;
            const { raw, schema } = found;
            this._composite = composite || {};
            this._raw = raw;
            this._schema = schema || { type: 'object' };
            this._user = user || {};
            this._changed.emit(undefined);
        }
    }
}
exports.Settings = Settings;
/**
 * A namespace for private module data.
 */
var Private;
(function (Private) {
    /* tslint:disable */
    /**
     * The schema for settings.
     */
    Private.SCHEMA = {
        $schema: 'http://json-schema.org/draft-06/schema',
        title: 'Jupyter Settings/Preferences Schema',
        description: 'Jupyter settings/preferences schema v0.1.0',
        type: 'object',
        additionalProperties: true,
        properties: {
            [exports.ICON_CLASS_KEY]: { type: 'string', default: 'jp-FileIcon' },
            [exports.ICON_LABEL_KEY]: { type: 'string', default: 'Plugin' }
        }
    };
    /* tslint:enable */
    /**
     * The default indentation level, uses spaces instead of tabs.
     */
    const indent = '    ';
    /**
     * Replacement text for schema properties missing a `description` field.
     */
    const nondescript = '[missing schema description]';
    /**
     * Replacement text for schema properties missing a `default` field.
     */
    const undefaulted = '[missing schema default]';
    /**
     * Replacement text for schema properties missing a `title` field.
     */
    const untitled = '[missing schema title]';
    /**
     * Returns an annotated (JSON with comments) version of a schema's defaults.
     */
    function annotatedDefaults(schema, plugin) {
        const { description, properties, title } = schema;
        const keys = Object.keys(properties).sort((a, b) => a.localeCompare(b));
        const length = Math.max((description || nondescript).length, plugin.length);
        return [
            '{',
            prefix(`${title || untitled}`),
            prefix(plugin),
            prefix(description || nondescript),
            prefix(line(length)),
            '',
            keys.map(key => defaultDocumentedValue(schema, key)).join(',\n\n'),
            '}'
        ].join('\n');
    }
    Private.annotatedDefaults = annotatedDefaults;
    /**
     * Returns an annotated (JSON with comments) version of a plugin's
     * setting data.
     */
    function annotatedPlugin(plugin, data) {
        const { description, title } = plugin.schema;
        const keys = Object.keys(data).sort((a, b) => a.localeCompare(b));
        const length = Math.max((description || nondescript).length, plugin.id.length);
        return [
            '{',
            prefix(`${title || untitled}`),
            prefix(plugin.id),
            prefix(description || nondescript),
            prefix(line(length)),
            '',
            keys
                .map(key => documentedValue(plugin.schema, key, data[key]))
                .join(',\n\n'),
            '}'
        ].join('\n');
    }
    Private.annotatedPlugin = annotatedPlugin;
    /**
     * Returns the default value-with-documentation-string for a
     * specific schema property.
     */
    function defaultDocumentedValue(schema, key) {
        const props = schema.properties && schema.properties[key];
        const description = (props && props['description']) || nondescript;
        const title = (props && props['title']) || untitled;
        const reified = reifyDefault(schema, key);
        const defaults = reified === undefined
            ? prefix(`"${key}": ${undefaulted}`)
            : prefix(`"${key}": ${JSON.stringify(reified, null, 2)}`, indent);
        return [
            prefix(`${title || untitled}`),
            prefix(description || nondescript),
            defaults
        ].join('\n');
    }
    /**
     * Returns a value-with-documentation-string for a specific schema property.
     */
    function documentedValue(schema, key, value) {
        const props = schema.properties && schema.properties[key];
        const description = (props && props['description']) || nondescript;
        const title = (props && props['title']) || untitled;
        const attribute = prefix(`"${key}": ${JSON.stringify(value, null, 2)}`, indent);
        return [prefix(title), prefix(description), attribute].join('\n');
    }
    /**
     * Returns a line of a specified length.
     */
    function line(length, ch = '*') {
        return new Array(length + 1).join(ch);
    }
    /**
     * Returns a documentation string with a comment prefix added on every line.
     */
    function prefix(source, pre = `${indent}\/\/ `) {
        return pre + source.split('\n').join(`\n${pre}`);
    }
    /**
     * Create a fully extrapolated default value for a root key in a schema.
     */
    function reifyDefault(schema, root) {
        // If the property is at the root level, traverse its schema.
        schema = (root ? schema.properties[root] : schema) || {};
        // If the property has no default or is a primitive, return.
        if (!('default' in schema) || schema.type !== 'object') {
            return schema.default;
        }
        // Make a copy of the default value to populate.
        const result = coreutils_1.JSONExt.deepCopy(schema.default);
        // Iterate through and populate each child property.
        for (let property in schema.properties || {}) {
            result[property] = reifyDefault(schema.properties[property]);
        }
        return result;
    }
    Private.reifyDefault = reifyDefault;
})(Private = exports.Private || (exports.Private = {}));
