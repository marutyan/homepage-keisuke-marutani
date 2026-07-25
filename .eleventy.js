module.exports = function (eleventyConfig) {
  for (const directory of ['css', 'js', 'images', 'favicon_images']) {
    eleventyConfig.addPassthroughCopy(directory);
  }

  const sortByYearDesc = (items = []) => (
    [...items].sort((left, right) => right.year - left.year)
  );

  eleventyConfig.addFilter('sortByYearDesc', sortByYearDesc);
  eleventyConfig.addFilter('groupByYearDesc', (items = []) => (
    sortByYearDesc(items).reduce((groups, publication) => {
      const currentGroup = groups.at(-1);

      if (!currentGroup || currentGroup.year !== publication.year) {
        groups.push({
          year: publication.year,
          publications: [publication],
        });
      } else {
        currentGroup.publications.push(publication);
      }

      return groups;
    }, [])
  ));

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
