const { exec } = require('child_process')
require('dotenv').config()

const SECRECT_KEY_AUTO_DEPLOY = process.env.SECRECT_KEY_AUTO_DEPLOY

async function deployMovinaviarFeDev(req, res) {
  let scriptPath = 'scripts/deploy-movinavir-fe-dev.sh';
  return upload2Deploy(req, res, scriptPath)
}

async function deployMovinaviarFeTest(req, res) {
  let scriptPath = 'scripts/deploy-movinavir-fe-test.sh';
  return upload2Deploy(req, res, scriptPath);
}

async function deployMovinaviarFeProd(req, res) {
  let scriptPath = 'scripts/deploy-movinavir-fe-prod.sh';
  return upload2Deploy(req, res, scriptPath);
}

async function deployChemcareFeDev(req, res) {
  let scriptPath = 'scripts/deploy-chemcare-fe-dev.sh';
  return upload2Deploy(req, res, scriptPath)
}

async function deployChemcareFeTest(req, res) {
  let scriptPath = 'scripts/deploy-chemcare-fe-test.sh';
  return upload2Deploy(req, res, scriptPath);
}

async function deployChemcareFeProd(req, res) {
  let scriptPath = 'scripts/deploy-chemcare-fe-prod.sh';
  return upload2Deploy(req, res, scriptPath);
}

async function deployDicomUniversalApiProd(req, res) {
  let scriptPath = 'scripts/deploy-universal-api.sh';
  runShellScript(scriptPath);
  res.send({ status: true });
}


/**
 * Upload file and exe
 * @param {*} req 
 * @param {*} res 
 * @param {*} scriptPath 
 */
async function upload2Deploy(req, res, scriptPath) {
  const header = req.headers;
  // check authen
  if (header['x-secret'] !== SECRECT_KEY_AUTO_DEPLOY) {
    return res.status(400).send({ error: 'Invalid request' });
  }

  if (!req.files)
    return res.status(400).send('No files were uploaded.');

  // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
  let { dist } = req.files;
  console.log("dist:: ", dist);

  if (!dist || !dist.data)
    return res.status(400).send('Files were invalid.');

  // Use the mv() method to place the file somewhere on your server
  // return new Promise((resolve, reject) => {
  //   return dist.mv('/tmp/' + dist.name, async (error) => {
  //     if (error) return res.status(500).send({ error });

  //     await runShellScript(scriptPath);
  //     res.send({ status: true });
  //   });
  // }

  // TODO try catch
  await moveFile(dist);
  await runShellScript(scriptPath);
  res.send({ status: true });
}

async function moveFile(dist) {
  return new Promise((resolve, reject) => {
    return dist.mv('/tmp/' + dist.name, (error) => {
      if (error) return reject(error);
      return resolve();
    });
  });
}

async function runShellScript(scriptFile) {
  console.log(`scriptFile:: ${scriptFile}`);
  return new Promise((resolve, reject) => {
    // dynamic file script and hostname, because we have more server instances
    return exec(`sh ${scriptFile}`, (error, stdout, stderr) => {
      console.log(`stdout:: ${stdout}`);
      if (error) {
        console.log(`exec error: ${error}`);
        return reject(error);
      }
      if (stderr && !stderr.startsWith('Pseudo-terminal will not')) {
        console.log(`stderr:: ${stderr}`);
        return reject(stderr);
      }
      return resolve(stdout);
    });
  });
}


module.exports = {
  deployDicomUniversalApiProd,
  deployChemcareFeDev,
  deployChemcareFeTest,
  deployChemcareFeProd,
  deployMovinaviarFeDev,
  deployMovinaviarFeTest,
  deployMovinaviarFeProd
}
