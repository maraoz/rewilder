import React from "react";
import Document, { Html, Head, Main, NextScript } from "next/document";
import emotionCache from "../lib/emotion-cache";
import createEmotionServer from "@emotion/server/create-instance";

const { extractCritical } = createEmotionServer(emotionCache);

export default class MyDocument extends Document {

  static async getInitialProps(ctx) {
    const initialProps = await Document.getInitialProps(ctx);
    const styles = extractCritical(initialProps.html);
    return {
      ...initialProps,
      styles: [
        initialProps.styles,
        <style
          key="emotion-css"
          dangerouslySetInnerHTML={{ __html: styles.css }}
          data-emotion-css={styles.ids.join(" ")}
        />,
      ],
    };
  }

  render() {
    // prettier-ignore
    return (
      <Html lang="en">
        <Head>
          <meta charSet="UTF-8" />
          {/* favicon */}
          <link rel="shortcut icon" href="/favicon.png" />
          
          <link href="/favicon-16x16.png" rel="icon" sizes="16x16" type="image/png" />
          <link href="/favicon-32x32.png" rel="icon" sizes="32x32" type="image/png"/>
          <link href="/apple-touch-icon.png" rel="apple-touch-icon" sizes="180x180" />
          <link href="/safari-pinned-tab.svg" rel="mask-icon" color="#4a9885" />
          <link href="/site.webmanifest" rel="manifest" />

        </Head>
        <body>
          <script>0</script>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
