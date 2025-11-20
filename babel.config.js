module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'], // or your preset
    plugins: [
      // other plugins...
      'react-native-reanimated/plugin', // ✅ must be last
    ],
  };
};
