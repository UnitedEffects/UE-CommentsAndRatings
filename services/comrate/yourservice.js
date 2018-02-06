/**
 * Created by bmotlagh on 10/19/17.
 */

import responder from '../response';

const email = {
    helloworld() {
        return new Promise((resolve, reject) => {
            resolve(responder.set200());
        });
    }
};

export default email;

