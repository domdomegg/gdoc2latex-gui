import './App.css';
import gdoc2latex from 'gdoc2latex';
import React, { useEffect, useState } from 'react';
import { exampleGdoc } from './exampleGdoc';
import DragDropFile from './DragDropFile';
import { unzipSync } from 'fflate';

const App = () => {
  const [gdoc, setGdoc] = useState('');
  const [display, setDisplay] = useState<"input" | "output">('input');

  return (
    <div>
      <header>
        <div>
          <h1>gdoc2latex GUI</h1>
          <p>Convert a Google Doc to LaTeX using <a href="https://github.com/domdomegg/gdoc2latex">gdoc2latex</a></p>
        </div>
      </header>
      {display === "input"
        ? <InputView setDisplay={setDisplay} gdoc={gdoc} setGdoc={setGdoc} />
        : <OutputView setDisplay={setDisplay} gdoc={gdoc} />}
    </div>
  );
}

const InputView = ({ setDisplay, gdoc, setGdoc }: { setDisplay: (display: "input" | "output") => void, gdoc: string, setGdoc: (str: string) => void }) => {
  const handleFiles = async (fileList: FileList) => {
    try {
      const html = await getHtmlFromFileList(fileList);
      setGdoc(html);
      setDisplay('output');
    } catch (err) {
      alert('Error: ' + (err instanceof Error ? err.message : String(err)))
    }
  }

  return (
    <section>
      <DragDropFile handleFiles={handleFiles} />
      <h2>Drag or paste in an HTML copy of your Google Doc</h2>
      <p>
        Get this from Google Docs with <span className="highlight">File ➜ Download ➜ Web page (.html)</span><br/>
        <button className="linkButton" onClick={() => { setGdoc(exampleGdoc); setDisplay('output') }}>Or see an example</button>.
      </p>
      <input id="file_input" type="file" accept="text/html, application/zip" onChange={e => e.target.files && handleFiles(e.target.files)} />
      <button onClick={() => document.getElementById('file_input')?.click()} style={{ marginTop: "40px" }}>Upload file</button>
      <div className='or-bar'>
        <div></div>
        <p>OR</p>
        <div></div>
      </div>
      <textarea
        autoFocus
        value={gdoc}
        rows={10}
        onChange={e => setGdoc(e.target.value)}
        onKeyDown={e => { if (e.key === "Enter") { setDisplay('output') } }}
        placeholder="<html><head><meta content=&quot;text/html; charset=UTF-8&quot; http-equiv=&quot;content-type&quot;>..."
      />
      {gdoc && !gdoc.startsWith('<html>') && <p>This doesn't start with <code>&lt;html&gt;</code>. Sure you have pasted in the HTML, not the doc itself?</p>}
      {gdoc && <button onClick={() => setDisplay('output')}>Gimme! Gimme! Gimme! (A LaTeX file)</button>}
    </section>
  );
}

const OutputView = ({ setDisplay, gdoc }: { setDisplay: (display: "input" | "output") => void, gdoc: string }) => {
  const response = catchAndTransformError(() => gdoc2latex({ inputHTML: gdoc }));

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setDisplay('input');
      }
    }
  
    document.addEventListener('keydown', handler)
    return () => {
      document.removeEventListener('keydown', handler)
    }
  }, [setDisplay]);

  const download = (filename: string, content: string) => {
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(content));
    element.setAttribute('download', filename);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }

  if (response.accepted) {
    return (
      <section>
        <h2>Here's your LaTeX:</h2>
        <textarea value={response.result.latex} rows={10} readOnly></textarea>
        {response.result.bibtex && <>
          <h2>and your BibTeX:</h2>
          <textarea value={response.result.bibtex} rows={10} readOnly></textarea>
        </>}
        <button onClick={() => {
          download('index.tex', response.result.latex);
          if (response.result.bibtex) download('index.bib', response.result.bibtex);
        }}>Download</button>
        <button className="linkButton" onClick={() => setDisplay('input')}>Go back</button>
      </section>
    );
  }

  return (
    <section>
      <h2>Something went wrong</h2>
      <p>Make sure that you uploaded a HTML doc, pasted the entire thing in,<br/>and formatted your doc as per the gdoc2latex instructions.</p>
      <p>In case it helps, here's the internal error we got:</p>
      <textarea value={response.message} rows={10} readOnly></textarea>
      <p>We've also logged the error to the console, where you can see a full stacktrace.</p>
      <br/>
      <button className="linkButton" onClick={() => setDisplay('input')}>Go back</button>
    </section>
  )
}

type Response<T> = Accepted<T> | Rejected;
interface Accepted<T> { accepted: true, result: T };
interface Rejected { accepted: false, message: string };

function catchAndTransformError<T>(fn: () => T): Response<T> {
  try {
    return { accepted: true, result: fn() };
  } catch (err) {
    console.error(err);
    return {
      accepted: false,
      message: err instanceof Error
        ? 'Error: ' + err.message
        : 'An error occurred converting that document'
    };
  }
}

const getHtmlFromFileList = async (fileList: FileList): Promise<string> => {
  if (fileList.length !== 1) {
    throw new Error('Please select exactly one file.');
  }

  const file = fileList[0];
  const fileName = file.name.toLowerCase();

  if (file.type !== "application/zip" && file.type !== "text/html") {
    throw new Error('Please select either a ZIP or HTML file.');
  }

  if (file.type === "application/zip") {
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    const unzipped: { [path: string]: Uint8Array } = unzipSync(uint8Array);

    const htmlFiles = Object.keys(unzipped).filter(path => path.toLowerCase().endsWith('.html'));

    if (htmlFiles.length === 0) {
      throw new Error('No HTML file found in the ZIP archive.');
    }

    if (htmlFiles.length > 1) {
      throw new Error('Multiple HTML files found in the ZIP archive.');
    }

    const htmlContent = new TextDecoder().decode(unzipped[htmlFiles[0]]);
    return htmlContent;
  }

  // Process HTML file
  if (fileName.endsWith('.html')) {
    return await file.text();
  }

  // This should never be reached due to earlier checks, but TypeScript might complain without it
  throw new Error('Unexpected file type.');
}

export default App;
