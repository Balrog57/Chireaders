const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.resolver.extraNodeModules = {
    stream: require.resolve('stream-browserify'),
    buffer: require.resolve('buffer'),
    events: require.resolve('events'),
    url: require.resolve('url'),
    assert: require.resolve('assert'),
    util: require.resolve('util'),
    net: require.resolve('events'), // Mock net with events or empty
    tls: require.resolve('events'), // Mock tls with events or empty
    fs: require.resolve('events'), // Mock fs
};

// Gérer le protocole node: pour les imports comme "node:stream"
config.resolver.resolveRequest = (context, moduleName, platform) => {
    if (moduleName.startsWith('node:')) {
        const name = moduleName.substring(5);
        if (config.resolver.extraNodeModules[name]) {
            return {
                filePath: config.resolver.extraNodeModules[name],
                type: 'sourceFile',
            };
        }
    }

    // Chaîner avec le résolveur par défaut
    return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
