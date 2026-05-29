'use strict';

const sendData = (res, data, status = 200) => res.status(status).json({ success: true, data });

module.exports = { sendData };
