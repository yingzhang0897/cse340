/* ***************************
 *  Build internal error view
 * ************************** */

const errorController = {};

// Function that intentionally throws an error
errorController.triggerError = (req, res, next) => {
    try {
        throw new Error("Sorry, this is an intentional 500 error for testing.");
    } catch (error) {
        next(error); // Pass the error to the middleware
    }
};

module.exports = errorController;
