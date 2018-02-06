/**
 * Created by bmotlagh on 10/19/17.
 */

import responder from '../responder';
import yourservice from './yourservice';
import log from '../log/logs';

const api = {
    helloworld(req, res) {
        yourservice.helloworld()
            .then(result => responder.send(res, result))
            .catch((err) => {
                logs.error(err);
                return responder.send(res, err);
            });
    },
};

export default api;
