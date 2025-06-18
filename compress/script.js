// script.js

// --- Service Worker Registration ---
// This is the entry point for making the app work offline (PWA).
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('Service Worker registered successfully:', registration);
      })
      .catch(error => {
        console.log('Service Worker registration failed:', error);
      });
  });
}


// --- DOM Element References ---
const uploader = document.getElementById('uploader');
const fileChosenText = document.getElementById('file-chosen');
const compressButton = document.getElementById('compressButton');
const buttonText = document.getElementById('button-text');
const loader = document.getElementById('loader');
const statusText = document.getElementById('status-text');
const progressBar = document.getElementById('progressBar');
const downloadLink = document.getElementById('downloadLink');

// --- FFmpeg.wasm Setup ---
const { createFFmpeg, fetchFile } = FFmpeg;
const ffmpeg = createFFmpeg({
    log: true, // Set to true to see detailed FFmpeg logs in the console
    // This allows us to get progress updates
    progress: ({ ratio }) => {
        // ratio is a value from 0 to 1
        progressBar.value = ratio * 100;
        statusText.textContent = `Compressing... ${Math.round(ratio * 100)}% complete.`;
    },
});

let selectedFile = null;

// --- Event Listeners ---
uploader.addEventListener('change', (e) => {
    selectedFile = e.target.files[0];
    if (selectedFile) {
        fileChosenText.textContent = `Selected: ${selectedFile.name}`;
        // Only enable the button if FFmpeg is loaded and a file is selected
        if (ffmpeg.isLoaded()) {
            compressButton.disabled = false;
        }
        // Reset UI for a new compression
        resetUI();
    }
});

compressButton.addEventListener('click', async () => {
    if (selectedFile) {
        await compressVideo();
    }
});


// --- Core Functions ---

/**
 * Loads the FFmpeg.wasm core. This is the first thing we do.
 * It's a large file, so we show a loading indicator.
 */
const loadFFmpeg = async () => {
    try {
        await ffmpeg.load();
        buttonText.textContent = 'Compress Video';
        loader.style.display = 'none'; // Hide loader
        statusText.textContent = 'FFmpeg loaded. Please select a video file.';
        // Don't enable the button yet, wait for a file to be selected.
    } catch (error) {
        console.error("Failed to load FFmpeg:", error);
        statusText.textContent = "Error: Could not load FFmpeg library. Please refresh.";
        compressButton.disabled = true;
        loader.style.display = 'none';
    }
};

/**
 * The main function to perform the video compression.
 */
const compressVideo = async () => {
    if (!ffmpeg.isLoaded() || !selectedFile) {
        statusText.textContent = "Error: FFmpeg not loaded or no file selected.";
        return;
    }

    // Disable button and show processing state
    compressButton.disabled = true;
    progressBar.style.display = 'block';
    downloadLink.style.display = 'none';
    statusText.textContent = 'Preparing video for compression...';

    const inputFileName = 'input.mp4'; // Use a consistent input name
    const outputFileName = `compressed_${selectedFile.name}`;

    try {
        // 1. Write the selected file to FFmpeg's virtual file system
        ffmpeg.FS('writeFile', inputFileName, await fetchFile(selectedFile));

        statusText.textContent = 'Starting compression. This may take some time...';

        // 2. Run the FFmpeg command
        await ffmpeg.run(
            '-i', inputFileName,
            '-c:v', 'libx264', // Specify the H.264 video codec
            '-crf', '22',       // Constant Rate Factor (0-51). Lower is better quality, higher is smaller size. 22 is a good balance.
            outputFileName
        );

        statusText.textContent = 'Compression complete! Preparing download...';

        // 3. Read the resulting file from the virtual file system
        const data = ffmpeg.FS('readFile', outputFileName);

        // 4. Create a downloadable link for the compressed video
        const videoBlob = new Blob([data.buffer], { type: 'video/mp4' });
        const videoUrl = URL.createObjectURL(videoBlob);

        downloadLink.href = videoUrl;
        downloadLink.download = outputFileName;
        downloadLink.style.display = 'inline-block';

        statusText.textContent = 'Your compressed video is ready!';
        progressBar.value = 100;

    } catch (error) {
        console.error("An error occurred during compression:", error);
        statusText.textContent = `Error: ${error.message}. Check console for details.`;
        progressBar.style.display = 'none';
    } finally {
        // Re-enable the button for another compression
        compressButton.disabled = false;
    }
};

/**
 * Resets the UI elements to their initial state for a new compression.
 */
const resetUI = () => {
    progressBar.style.display = 'none';
    progressBar.value = 0;
    downloadLink.style.display = 'none';
    URL.revokeObjectURL(downloadLink.href); // Clean up old object URL
    statusText.textContent = 'Ready to compress the selected video.';
};

// --- Initial Execution ---
// Start loading FFmpeg as soon as the script runs.
loadFFmpeg();
