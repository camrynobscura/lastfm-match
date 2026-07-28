const Footer = () => (
  <>
    <footer className='site-footer'>
      <p>
        Powered by the{' '}
        <a href='https://www.last.fm/' target='_blank' rel='noreferrer'>
          Last.fm
        </a>{' '}
        API.
      </p>
      <p>
        Made by{' '}
        <a href='https://www.camrynpearson.com/' target='_blank' rel='noreferrer'>
          Camryn
        </a> :&#41;
      </p>
    </footer>
    {/* iOS 26 Safari tints its own collapsed toolbar by sampling the
        background-color of a fixed/sticky element near the viewport edge,
        rather than reading theme-color -- with no such element on the page,
        it was falling back to some other color instead of this footer's
        ink. gives it something correct to sample. */}
    <div className='ios-toolbar-tint' aria-hidden='true' />
  </>
)

export default Footer
