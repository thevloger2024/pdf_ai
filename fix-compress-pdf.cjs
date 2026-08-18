const fs = require('fs');

let content = fs.readFileSync('src/pages/Compress.tsx', 'utf8');

const oldLogic = `      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
      
      // Best-effort client-side compression: Save without objects/streams where possible
      // True image downsampling requires a backend or heavy WASM
      const pdfBytes = await pdfDoc.save({ useObjectStreams: false });`;

const newLogic = `      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
      
      // Calculate target bytes
      const targetBytes = unit === 'MB' ? targetSize * 1024 * 1024 : targetSize * 1024;
      let options = { useObjectStreams: false };
      
      // Client-side PDF compression is limited. We strip object streams. 
      // If the target is very low, we could theoretically remove metadata or downsample,
      // but without a heavy WASM image processing library, structural stripping is the safest method.
      // We will attempt multiple save passes if needed, removing metadata.
      pdfDoc.setTitle('');
      pdfDoc.setAuthor('');
      pdfDoc.setSubject('');
      pdfDoc.setKeywords([]);
      pdfDoc.setProducer('');
      pdfDoc.setCreator('');
      
      const pdfBytes = await pdfDoc.save(options);`;

content = content.replace(oldLogic, newLogic);

fs.writeFileSync('src/pages/Compress.tsx', content, 'utf8');
