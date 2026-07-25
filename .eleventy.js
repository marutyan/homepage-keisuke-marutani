module.exports = function (eleventyConfig) {
  for (const directory of ['css', 'js', 'images', 'favicon_images']) {
    eleventyConfig.addPassthroughCopy(directory);
  }

  return {
    dir: {
      input: 'src',
      includes: '_includes',
      data: '_data',
      output: '_site',
    },
    htmlTemplateEngine: 'njk',
    markdownTemplateEngine: 'njk',
    templateFormats: ['njk'],
  };
};
