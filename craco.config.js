module.exports = {
  webpack: {
    configure: (webpackConfig, { paths }) => {
      return {
        ...webpackConfig,
        entry: {
          main: paths.appIndexJs,
        },
        output: {
          ...webpackConfig.output,
          filename: 'static/js/[name].js',
        },
        optimization: {
          ...webpackConfig.optimization,
          runtimeChunk: false,
        },
      };
    },
  },
};
