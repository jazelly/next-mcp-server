export default {
    transform: {},
    extensionsToTreatAsEsm: ['.ts'],
    moduleNameMapper: {
        '^(\\.{1,2}/.*)\\.js$': '$1',
    },
    testEnvironment: 'node',
    testMatch: ['**/*.test.ts'],
    preset: 'ts-jest/presets/default-esm',
    moduleFileExtensions: ['ts', 'js', 'json'],
    globals: {
        'ts-jest': {
            useESM: true,
        },
    },
};
