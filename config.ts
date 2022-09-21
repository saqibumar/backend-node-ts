import yaml from 'js-yaml';
import fs from 'fs';
import path from 'path';
import deepmerge from 'deepmerge';
import cmd from 'node-cmd';


const ROASTER_APP_HOME = process.env.ROASTER_APP_HOME || '.';
const CONFIG_FILENAME = process.env.ROASTER_APP_CONFIG_FILENAME || 'config.local.yaml';
const BASE_CONFIG_FILENAME = 'config.yaml';

const configPath = path.join(ROASTER_APP_HOME, CONFIG_FILENAME);
const baseConfigPath = path.resolve(process.cwd(), `./${BASE_CONFIG_FILENAME}`);

let configuration: any = {};
let baseConfiguration: any = {};

try {
    configuration = yaml.load(fs.readFileSync(configPath, 'utf8'));
} catch (err) {}

try {
    baseConfiguration = yaml.load(fs.readFileSync(baseConfigPath, 'utf8'));
} catch (err) {
    console.error(`Configuration: Failed to load base configuration from ${baseConfigPath}`, err.message);
}

const mergedConfiguration: any = deepmerge(baseConfiguration, configuration || {});

const getVersion = (): string => {
    let version = 'UNKNOWN';
    const filePath = path.resolve(process.cwd(), './.version');

    try {
        const content = fs.readFileSync(filePath);

        version = content.toString().replace(/\r\n|\n|\r/g, '');
    } catch (err) {
        console.info(`Version file ${filePath} is missing. Generating app version in development mode.`);
        const branch = cmd.runSync("git branch --show-current");

        if (branch.data) {
            const lastCommitHash = cmd.runSync("git rev-parse --short HEAD");

            version = `${branch.data}+sha.${lastCommitHash.data}`.replace(
                /\r\n|\n|\r/g,
                ''
            );
        }
    }

    return version;
};

mergedConfiguration.app_version = getVersion();

export const config = mergedConfiguration;
