/**
 * Created by bmotlagh on 10/19/17.
 */

const helper = {
    isJson(check) {
        try {
            JSON.parse(check);
            return true;
        } catch (e) {
            return false;
        }
    },
    elementExists(property, check, arr) {
        return arr.some(function(el) {
            return el[property] === check;
        });
    }
};

export default helper;
