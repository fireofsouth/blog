import json from 'rollup-plugin-json';

export default {
    input: 'redux/index.js',
    output: {
        file: 'bundle.js',
        format: 'umd',
        name: 'MyBundle',
    },
    plugins: [json()],
};
