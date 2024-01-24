const { getRepository } = require('typeorm');
const Course = require('../model/Course');

const CourseResolver = {
  getFiltersForCourse: async ({ courseId }) => {
    const courseRepository = getRepository(Course);
    return courseRepository.findOne(courseId, { relations: ['filters'] });
  },
};

module.exports = CourseResolver;