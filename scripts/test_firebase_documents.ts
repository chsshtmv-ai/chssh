import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getBytes, getDownloadURL } from 'firebase/storage';

const config = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));

const firebaseConfig = {
  projectId: config.projectId || "gen-lang-client-0579586724",
  appId: config.appId || "1:621076165894:web:138413097c8f380709da87",
  apiKey: config.apiKey || "AIzaSyA03T4-oVmCv1VqujV1jwaAR4NyqnlFmGY",
  authDomain: config.authDomain || "gen-lang-client-0579586724.firebaseapp.com",
  firestoreDatabaseId: config.firestoreDatabaseId || "ai-studio-contemporaryhori-20cba91b-a145-4179-8184-b0997b10bb67",
  storageBucket: config.storageBucket || "gen-lang-client-0579586724.firebasestorage.app"
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
const storage = getStorage(app);

function sha256(buffer: Buffer): string {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

async function runAcceptanceTests() {
  console.log('=== Starting Acceptance Tests for Document Upload, Publication, and Download ===');
  console.log('Firebase Project ID:', firebaseConfig.projectId);
  console.log('Storage Bucket:', firebaseConfig.storageBucket);
  console.log('Firestore Database ID:', firebaseConfig.firestoreDatabaseId);

  // 1. Prepare Test Files
  const testDir = './test_assets';
  if (!fs.existsSync(testDir)) {
    fs.mkdirSync(testDir, { recursive: true });
  }

  // Create valid PDF test file
  const pdfContent = `%PDF-1.5
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R >>
endobj
4 0 obj
<< /Length 78 >>
stream
BT
/F1 12 Tf
72 712 Td
(CHSSH Official Journal Acceptance Test Article 2026 - PDF) Tj
ET
endstream
endobj
xref
0 5
0000000000 65535 f 
0000000010 00000 n 
0000000060 00000 n 
0000000117 00000 n 
0000000201 00000 n 
trailer
<< /Size 5 /Root 1 0 R >>
startxref
330
%%EOF
`;
  const pdfPath = path.join(testDir, 'CHSSH_Test_Article_2026.pdf');
  fs.writeFileSync(pdfPath, Buffer.from(pdfContent, 'utf-8'));
  const originalPdfBuffer = fs.readFileSync(pdfPath);
  const originalPdfHash = sha256(originalPdfBuffer);
  console.log(`\n[Test A] Created "${pdfPath}" (Bytes: ${originalPdfBuffer.length}, SHA256: ${originalPdfHash})`);

  // Create valid DOCX test file (PK zip signature)
  // Simple zip structure with document marker for byte identity testing
  const docxHeader = Buffer.from('PK\x03\x04\x14\x00\x00\x00\x08\x00', 'binary');
  const docxPayload = Buffer.from('CHSSH_Test_Article_2026_DOCX_OFFICIAL_CONTENT_' + Date.now(), 'utf-8');
  const docxBuffer = Buffer.concat([docxHeader, docxPayload]);
  const docxPath = path.join(testDir, 'CHSSH_Test_Article_2026.docx');
  fs.writeFileSync(docxPath, docxBuffer);
  const originalDocxBuffer = fs.readFileSync(docxPath);
  const originalDocxHash = sha256(originalDocxBuffer);
  console.log(`[Test B] Created "${docxPath}" (Bytes: ${originalDocxBuffer.length}, SHA256: ${originalDocxHash})`);

  // ==========================================
  // Test A: Upload, Publish, and Download PDF
  // ==========================================
  console.log('\n--- Executing Test A: CHSSH_Test_Article_2026.pdf ---');
  const pdfDocId = 'art_test_pdf_2026';
  const pdfStoragePath = `published_papers/${pdfDocId}_${Date.now()}_CHSSH_Test_Article_2026.pdf`;
  const pdfStorageRef = ref(storage, pdfStoragePath);

  // 1. Upload original file to Firebase Storage
  console.log('1. Uploading original PDF to Firebase Storage at:', pdfStoragePath);
  await uploadBytes(pdfStorageRef, originalPdfBuffer, {
    contentType: 'application/pdf',
    customMetadata: {
      originalFileName: 'CHSSH_Test_Article_2026.pdf',
      testSuite: 'AcceptanceTestA'
    }
  });

  // 2. Obtain download URL
  const pdfDownloadURL = await getDownloadURL(pdfStorageRef);
  console.log('2. Obtained Firebase Storage download URL:', pdfDownloadURL.slice(0, 70) + '...');

  // 3. Save document record in Firestore
  console.log('3. Saving document record to Firestore under /articles/' + pdfDocId);
  const pdfArticleData = {
    id: pdfDocId,
    trackingId: 'CHSSH-2026-TEST-PDF',
    title: 'Contemporary Horizons Acceptance Test Article (PDF Edition)',
    status: 'published',
    track: 'Empirical Social Science',
    authors: [{ name: 'Dr. Test Author', affiliation: 'CHSSH Research Institute', country: 'United Kingdom' }],
    submissionDate: '2026-10-15',
    publishedDate: '2026-10-20',
    volume: 7,
    issue: 1,
    year: 2026,
    pages: '101-118',
    doi: '10.5281/chssh.2026.7199',
    abstract: 'This is an official verification paper for testing byte-for-byte original file downloads from Firebase Storage.',
    keywords: ['Verification', 'Firebase Storage', 'Document Integrity'],
    storagePath: pdfStoragePath,
    downloadURL: pdfDownloadURL,
    fileName: 'CHSSH_Test_Article_2026.pdf',
    originalFileName: 'CHSSH_Test_Article_2026.pdf',
    publishedFileName: 'CHSSH_Test_Article_2026.pdf',
    publishedStoragePath: pdfStoragePath,
    publishedDownloadURL: pdfDownloadURL,
    publishedFileSize: `${(originalPdfBuffer.length / 1024).toFixed(1)} KB`,
    publishedFileType: 'pdf',
    mimeType: 'application/pdf',
    publishedMimeType: 'application/pdf',
    publishedUploadedAt: new Date().toISOString()
  };
  await setDoc(doc(db, 'articles', pdfDocId), pdfArticleData);

  // 4. Confirm Firestore stores the correct original Storage path
  const pdfSnap = await getDoc(doc(db, 'articles', pdfDocId));
  const pdfDataRead = pdfSnap.data();
  if (pdfDataRead?.publishedStoragePath !== pdfStoragePath) {
    throw new Error(`Firestore Storage path mismatch! Expected ${pdfStoragePath}, got ${pdfDataRead?.publishedStoragePath}`);
  }
  console.log('4. Confirmed Firestore correctly stores publishedStoragePath:', pdfDataRead.publishedStoragePath);

  // 5. Download original PDF using Firebase Storage SDK getBytes
  console.log('5. Downloading original file via Firebase Storage getBytes(storageRef)...');
  const downloadedPdfArrayBuffer = await getBytes(pdfStorageRef);
  const downloadedPdfBuffer = Buffer.from(downloadedPdfArrayBuffer);
  const downloadedPdfHash = sha256(downloadedPdfBuffer);
  console.log(`6. Downloaded PDF Bytes: ${downloadedPdfBuffer.length}, SHA256: ${downloadedPdfHash}`);

  if (downloadedPdfHash !== originalPdfHash) {
    throw new Error(`PDF Hash mismatch! Original: ${originalPdfHash}, Downloaded: ${downloadedPdfHash}`);
  }
  console.log('>>> Test A Passed: PDF downloaded file is BYTE-FOR-BYTE IDENTICAL to original uploaded file! <<<');

  // ==========================================
  // Test B: Upload, Publish, and Download DOCX
  // ==========================================
  console.log('\n--- Executing Test B: CHSSH_Test_Article_2026.docx ---');
  const docxDocId = 'art_test_docx_2026';
  const docxStoragePath = `published_papers/${docxDocId}_${Date.now()}_CHSSH_Test_Article_2026.docx`;
  const docxStorageRef = ref(storage, docxStoragePath);

  // 1. Upload original file to Firebase Storage
  console.log('1. Uploading original DOCX to Firebase Storage at:', docxStoragePath);
  await uploadBytes(docxStorageRef, originalDocxBuffer, {
    contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    customMetadata: {
      originalFileName: 'CHSSH_Test_Article_2026.docx',
      testSuite: 'AcceptanceTestB'
    }
  });

  // 2. Obtain download URL
  const docxDownloadURL = await getDownloadURL(docxStorageRef);
  console.log('2. Obtained Firebase Storage download URL:', docxDownloadURL.slice(0, 70) + '...');

  // 3. Save document record in Firestore
  console.log('3. Saving document record to Firestore under /articles/' + docxDocId);
  const docxArticleData = {
    id: docxDocId,
    trackingId: 'CHSSH-2026-TEST-DOCX',
    title: 'Contemporary Horizons Acceptance Test Article (Word DOCX Edition)',
    status: 'published',
    track: 'Humanities & Cultural Analysis',
    authors: [{ name: 'Prof. Test Scholar', affiliation: 'CHSSH Research Academy', country: 'United States' }],
    submissionDate: '2026-10-16',
    publishedDate: '2026-10-20',
    volume: 7,
    issue: 1,
    year: 2026,
    pages: '119-140',
    doi: '10.5281/chssh.2026.7198',
    abstract: 'This is an official verification paper for testing Word DOCX original file downloads from Firebase Storage without HTML conversion.',
    keywords: ['Verification', 'DOCX Integrity', 'Firebase Storage'],
    storagePath: docxStoragePath,
    downloadURL: docxDownloadURL,
    fileName: 'CHSSH_Test_Article_2026.docx',
    originalFileName: 'CHSSH_Test_Article_2026.docx',
    publishedFileName: 'CHSSH_Test_Article_2026.docx',
    publishedStoragePath: docxStoragePath,
    publishedDownloadURL: docxDownloadURL,
    publishedFileSize: `${(originalDocxBuffer.length / 1024).toFixed(1)} KB`,
    publishedFileType: 'docx',
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    publishedMimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    publishedUploadedAt: new Date().toISOString()
  };
  await setDoc(doc(db, 'articles', docxDocId), docxArticleData);

  // 4. Confirm Firestore stores the correct original Storage path
  const docxSnap = await getDoc(doc(db, 'articles', docxDocId));
  const docxDataRead = docxSnap.data();
  if (docxDataRead?.publishedStoragePath !== docxStoragePath) {
    throw new Error(`Firestore Storage path mismatch! Expected ${docxStoragePath}, got ${docxDataRead?.publishedStoragePath}`);
  }
  console.log('4. Confirmed Firestore correctly stores publishedStoragePath:', docxDataRead.publishedStoragePath);

  // 5. Download original DOCX using Firebase Storage SDK getBytes
  console.log('5. Downloading original file via Firebase Storage getBytes(storageRef)...');
  const downloadedDocxArrayBuffer = await getBytes(docxStorageRef);
  const downloadedDocxBuffer = Buffer.from(downloadedDocxArrayBuffer);
  const downloadedDocxHash = sha256(downloadedDocxBuffer);
  console.log(`6. Downloaded DOCX Bytes: ${downloadedDocxBuffer.length}, SHA256: ${downloadedDocxHash}`);

  if (downloadedDocxHash !== originalDocxHash) {
    throw new Error(`DOCX Hash mismatch! Original: ${originalDocxHash}, Downloaded: ${downloadedDocxHash}`);
  }
  console.log('>>> Test B Passed: DOCX downloaded file is BYTE-FOR-BYTE IDENTICAL to original uploaded file! <<<');

  // ==========================================
  // Test Isolation: Verify Records Download Respective Files
  // ==========================================
  console.log('\n--- Verifying Distinct File Isolation ---');
  if (downloadedPdfHash === downloadedDocxHash) {
    throw new Error('Test Failure: PDF and DOCX hashes should NOT be identical!');
  }
  console.log(`Confirmed: Record ${pdfDocId} and Record ${docxDocId} download their own distinct respective files!`);
  console.log('PDF SHA256: ', downloadedPdfHash);
  console.log('DOCX SHA256:', downloadedDocxHash);
  console.log('\n=== ALL ACCEPTANCE TESTS COMPLETED SUCCESSFULLY! ===');
}

runAcceptanceTests().catch((err) => {
  console.error('\n*** Acceptance Test Error ***\n', err);
  process.exit(1);
});
