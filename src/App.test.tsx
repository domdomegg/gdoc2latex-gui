import { fireEvent, render, screen } from '@testing-library/react';
import App from './App';
import { exampleGdoc } from './exampleGdoc';

const exampleGdocSimple = `<html><head><meta content="text/html; charset=UTF-8" http-equiv="content-type"><style type="text/css">ol{margin:0;padding:0}table td,table th{padding:0}.c0{color:#000000;font-weight:400;text-decoration:none;vertical-align:baseline;font-size:11pt;font-family:"Arial";font-style:normal}.c3{padding-top:0pt;padding-bottom:0pt;line-height:1.15;orphans:2;widows:2;text-align:left;height:11pt}.c1{color:#000000;font-weight:400;text-decoration:none;vertical-align:baseline;font-size:26pt;font-family:"Arial";font-style:normal}.c2{padding-top:0pt;padding-bottom:3pt;line-height:1.15;page-break-after:avoid;orphans:2;widows:2;text-align:left}.c5{padding-top:0pt;padding-bottom:0pt;line-height:1.15;orphans:2;widows:2;text-align:left}.c4{background-color:#ffffff;max-width:451.3pt;padding:72pt 72pt 72pt 72pt}.title{padding-top:0pt;color:#000000;font-size:26pt;padding-bottom:3pt;font-family:"Arial";line-height:1.15;page-break-after:avoid;orphans:2;widows:2;text-align:left}.subtitle{padding-top:0pt;color:#666666;font-size:15pt;padding-bottom:16pt;font-family:"Arial";line-height:1.15;page-break-after:avoid;orphans:2;widows:2;text-align:left}li{color:#000000;font-size:11pt;font-family:"Arial"}p{margin:0;color:#000000;font-size:11pt;font-family:"Arial"}h1{padding-top:20pt;color:#000000;font-size:20pt;padding-bottom:6pt;font-family:"Arial";line-height:1.15;page-break-after:avoid;orphans:2;widows:2;text-align:left}h2{padding-top:18pt;color:#000000;font-size:16pt;padding-bottom:6pt;font-family:"Arial";line-height:1.15;page-break-after:avoid;orphans:2;widows:2;text-align:left}h3{padding-top:16pt;color:#434343;font-size:14pt;padding-bottom:4pt;font-family:"Arial";line-height:1.15;page-break-after:avoid;orphans:2;widows:2;text-align:left}h4{padding-top:14pt;color:#666666;font-size:12pt;padding-bottom:4pt;font-family:"Arial";line-height:1.15;page-break-after:avoid;orphans:2;widows:2;text-align:left}h5{padding-top:12pt;color:#666666;font-size:11pt;padding-bottom:4pt;font-family:"Arial";line-height:1.15;page-break-after:avoid;orphans:2;widows:2;text-align:left}h6{padding-top:12pt;color:#666666;font-size:11pt;padding-bottom:4pt;font-family:"Arial";line-height:1.15;page-break-after:avoid;font-style:italic;orphans:2;widows:2;text-align:left}</style></head><body class="c4"><p class="c2 title" id="h.mkd460etze8q"><span class="c1">Simple doc</span></p><p class="c3"><span class="c0"></span></p><p class="c5"><span class="c0">I am a very simple document</span></p></body></html>`;

test('renders gdoc2latex GUI title', () => {
  render(<App />);
  const title = screen.queryByText(/gdoc2latex GUI/i);
  expect(title).toBeInTheDocument();
});

test('gives LaTeX and BibTeX output when clicking example', () => {
  render(<App />);
  expect(screen.queryByText(/Here's your LaTeX/)).not.toBeInTheDocument();
  expect(screen.queryByText(/and your BibTeX/)).not.toBeInTheDocument();
  
  fireEvent.click(screen.getByText(/example/));
  
  expect(screen.queryByText(/Here's your LaTeX/)).toBeInTheDocument();
  expect(screen.queryByText(/and your BibTeX/)).toBeInTheDocument();
  expect(screen.queryByText(/Here’s some content, originally written in Google Docs. It demonstrates using some of the features of gdoc2latex./)).toBeInTheDocument();
  expect(screen.queryByText(/author={Alexander Feder}/)).toBeInTheDocument();
});

test('gives LaTeX and BibTeX output when entering demo example', () => {
  const renderResult = render(<App />);
  expect(screen.queryByText(/Here's your LaTeX/)).not.toBeInTheDocument();  
  
  fireEvent.change(renderResult.container.querySelector('textarea')!, { target: { value: exampleGdoc } });
  fireEvent.click(screen.getByText(/Gimme! Gimme! Gimme!/));

  expect(screen.queryByText(/Here's your LaTeX/)).toBeInTheDocument();
  expect(screen.queryByText(/Here’s some content, originally written in Google Docs. It demonstrates using some of the features of gdoc2latex./)).toBeInTheDocument();
  expect(screen.queryByText(/and your BibTeX/)).toBeInTheDocument();
  expect(screen.queryByText(/author={Alexander Feder}/)).toBeInTheDocument();
});

test('gives LaTeX and BibTeX output when entering simple example', () => {
  const renderResult = render(<App />);
  expect(screen.queryByText(/Here's your LaTeX/)).not.toBeInTheDocument();  
  
  fireEvent.change(renderResult.container.querySelector('textarea')!, { target: { value: exampleGdocSimple } });
  fireEvent.click(screen.getByText(/Gimme! Gimme! Gimme!/));
  
  expect(screen.queryByText(/Here's your LaTeX/)).toBeInTheDocument();
  expect(screen.queryByText(/I am a very simple document/)).toBeInTheDocument();
  expect(screen.queryByText(/and your BibTeX/)).not.toBeInTheDocument();
});

test('can click example and go back with button', () => {
  render(<App />);
  expect(screen.queryByText(/Here's your LaTeX/)).not.toBeInTheDocument();  
  
  fireEvent.click(screen.getByText(/example/));
  
  expect(screen.queryByText(/Here's your LaTeX/)).toBeInTheDocument();

  fireEvent.click(screen.getByText(/Go back/));

  expect(screen.queryByText(/Here's your LaTeX/)).not.toBeInTheDocument();  
});

test('can click example and go back with esc key', () => {
  const renderResult = render(<App />);
  expect(screen.queryByText(/Here's your LaTeX/)).not.toBeInTheDocument();  
  
  fireEvent.click(screen.getByText(/example/));
  
  expect(screen.queryByText(/Here's your LaTeX/)).toBeInTheDocument();

  fireEvent.keyDown(renderResult.container, { key: 'Escape' });

  expect(screen.queryByText(/Here's your LaTeX/)).not.toBeInTheDocument();  
});

test('can enter example and go back with button', () => {
  const renderResult = render(<App />);
  expect(screen.queryByText(/Here's your LaTeX/)).not.toBeInTheDocument();  
  
  fireEvent.change(renderResult.container.querySelector('textarea')!, { target: { value: exampleGdoc } });
  fireEvent.click(screen.getByText(/Gimme! Gimme! Gimme!/));

  expect(screen.queryByText(/Here's your LaTeX/)).toBeInTheDocument();

  fireEvent.click(screen.getByText(/Go back/));

  expect(screen.queryByText(/Here's your LaTeX/)).not.toBeInTheDocument(); 
});

test('can enter invalid example and go back with button', () => {
  const renderResult = render(<App />);
  expect(screen.queryByText(/Something went wrong/)).not.toBeInTheDocument();
  expect(screen.queryByText(/Here's your LaTeX/)).not.toBeInTheDocument();  
  
  fireEvent.change(renderResult.container.querySelector('textarea')!, { target: { value: 'Not valid' } });
  fireEvent.click(screen.getByText(/Gimme! Gimme! Gimme!/));

  expect(screen.queryByText(/Something went wrong/)).toBeInTheDocument();
  expect(screen.queryByText(/Here's your LaTeX/)).not.toBeInTheDocument(); 
  
  fireEvent.click(screen.getByText(/Go back/));
  
  expect(screen.queryByText(/Something went wrong/)).not.toBeInTheDocument();
  expect(screen.queryByText(/Here's your LaTeX/)).not.toBeInTheDocument(); 
});

test('user journey matches snapshots', () => {
  const renderResult = render(<App />);

  // Homepage
  expect(renderResult.container).toMatchSnapshot(); 

  // Error
  fireEvent.change(renderResult.container.querySelector('textarea')!, { target: { value: 'Not valid' } });
  fireEvent.click(screen.getByText(/Gimme! Gimme! Gimme!/));
  expect(renderResult.container).toMatchSnapshot();

  // Success
  fireEvent.click(screen.getByText(/Go back/));
  fireEvent.change(renderResult.container.querySelector('textarea')!, { target: { value: exampleGdocSimple } });
  fireEvent.click(screen.getByText(/Gimme! Gimme! Gimme!/));
  expect(renderResult.container).toMatchSnapshot();
})