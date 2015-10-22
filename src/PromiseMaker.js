export default function PromiseMaker(req) {
  req.promise = function() {
    return new Promise((resolve, reject) => {
      req.end((err, res) => {
        err = err || res.error;
        if(err) {
          reject(err);
        } else {
          resolve(res.body);
        }
      });
    });
  };
}