const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

config.resolver.extraNodeModules = {
    'stream': require.resolve('stream-browserify'),
    'buffer': require.resolve('buffer'),
    'events': require.resolve('events'),
    'url': require.resolve('url'),
    'assert': require.resolve('assert'),
    'util': require.resolve('util'),
    'net': require.resolve('events'), // Mock avec events qui est léger et safe
    'tls': require.resolve('events'),
    'fs': require.resolve('events'),
};

config.resolver.resolveRequest = (context, moduleName, platform) => {
    // Remplacer les appels "node:x" par "x" pour utiliser nos polyfills
    if (moduleName.startsWith('node:')) {
        const name = moduleName.substring(5);
        if (config.resolver.extraNodeModules[name]) {
            return {
                filePath: config.resolver.extraNodeModules[name],
                type: 'sourceFile',
            };
        }
    }
    return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
