const axios = require('axios')
const qs = require('qs')
const crypto = require('crypto')

const apiUrl = 'https://slack.com/api'

const Slack = function (opts) {
  const chat = {}
  chat.postMessage = async (messageOpts) => {
    messageOpts.token = opts.token
    const result = await axios.post(`${apiUrl}/chat.postMessage`, qs.stringify(messageOpts))
    try {
      return [false, result.data]
    } catch (ex) {
      return [true, ex]
    }
  }
  function verifySignature (req) {
    const slackSigningSecret = opts.signingSecret
    const requestSignature = req.headers['X-Slack-Signature']
    const requestTimestamp = req.headers['X-Slack-Request-Timestamp']
    const hmac = crypto.createHmac('sha256', slackSigningSecret)
    let requestBodyString = req.body
    if (typeof requestBodyString !== 'string') {
      requestBodyString = JSON.stringify(req.body)
    }
    const [version, hash] = requestSignature.split('=')
    const base = `${version}:${requestTimestamp}:${requestBodyString}`
    const computedHash = hmac.update(base, 'utf8').digest('hex')

    return hash === computedHash
  }
  return {
    chat,
    verifySignature
  }
}

exports.Slack = Slack
