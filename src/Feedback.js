import React, { Component } from 'react';

//the same Google Form as the bots' /feedback, so site feedback lands in the same Sheet
const FORM = 'https://docs.google.com/forms/d/e/1FAIpQLSedneM-ImrTrMm92VgBKOThjvEsf2Jq95HiesN7pxh_8wWg-w/';
const ENTRY = { bot: 'entry.1736849516', server: 'entry.1282692316', user: 'entry.1722619971', feedback: 'entry.1440311554', email: 'entry.1213316943' };

export const feedbackFields = ({ user, feedback, email }) => {
  const params = new URLSearchParams({ [ENTRY.bot]: 'D1-C3 (dice site)', [ENTRY.server]: 'dice.skyjedi.com', [ENTRY.user]: user || 'Not given' });
  if (feedback !== undefined) params.set(ENTRY.feedback, feedback);
  if (email) params.set(ENTRY.email, email);
  return params;
};

//pre-filled form link, the fallback when the post can't go out
export const feedbackUrl = (answers) => `${FORM}viewform?usp=pp_url&${feedbackFields({ ...answers, feedback: undefined })}`;

class Feedback extends Component {
  state = { status: 'idle' };

  send = async (event) => {
    event.preventDefault();
    const answers = { user: this.props.getUser(), feedback: this.refs.feedback.value.trim(), email: this.refs.email.value.trim() };
    if (!answers.feedback) return;
    this.setState({ status: 'sending' });
    try {
      //Google Forms sends no CORS headers: no-cors posts it but hides the reply, so only a network failure is caught
      await fetch(`${FORM}formResponse`, { method: 'POST', mode: 'no-cors', body: feedbackFields(answers) });
      this.setState({ status: 'sent' });
    } catch (error) {
      console.error('Feedback form post failed:', error);
      this.setState({ status: 'failed', url: feedbackUrl(answers) });
    }
  };

  render() {
    const { status, url } = this.state;
    if (status === 'sent') return <p className='feedback-note'>Thanks, your feedback was sent.</p>;
    return (
      <details className='feedback'>
        <summary>Send feedback</summary>
        <form onSubmit={this.send}>
          <label htmlFor='feedback'>Feedback (sent with your name)</label>
          <textarea id='feedback' ref='feedback' required maxLength={4000} rows={4} />
          <label htmlFor='feedback-email'>Email, if you'd like a reply (optional)</label>
          <input id='feedback-email' ref='email' type='email' autoComplete='email' />
          <button disabled={status === 'sending'}>{status === 'sending' ? 'Sending...' : 'Send feedback'}</button>
          {status === 'failed' && <p className='feedback-note'>Sorry, it couldn't be sent. Please copy your text and send it <a href={url} target='_blank' rel='noopener noreferrer'>here</a> instead.</p>}
        </form>
      </details>
    );
  }
}

export default Feedback;
