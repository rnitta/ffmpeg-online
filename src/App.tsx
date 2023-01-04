import React from 'react';
import { FileUploader } from 'react-drag-drop-files';
import { chakra } from '@chakra-ui/react';
import { nanoid } from 'nanoid'
import { createFFmpeg } from '@ffmpeg/ffmpeg';

const fileTypes = ['mp4', 'mov'] as const;

const ffmpegCoreVersion = '0.11.0';
const corePath = `https://unpkg.com/@ffmpeg/core@${ffmpegCoreVersion}/dist/ffmpeg-core.js`;

// https://tech-blog.voicy.jp/entry/2022/07/19/101954
async function compressMp4Video(
  binaryData: Uint8Array,
  inputVideoName: string,
  mp4Name: string
) {
  const ffmpeg = createFFmpeg({corePath, log: true});
  await ffmpeg.load();
  ffmpeg.FS('writeFile', inputVideoName, binaryData);
  // https://utamt.hatenablog.com/entry/2020/05/05/180037
  await ffmpeg.run('-i', inputVideoName, '-crf', '23', mp4Name);
  const videoUint8Array = ffmpeg.FS('readFile', mp4Name);
  try {
    ffmpeg.exit();
  } catch (error) {
  }
  return videoUint8Array;
}

function App() {
  const handleChange = async (file: File | undefined) => {
    if (file) {
      if(file.size > 2_000_000_000) {
        window.alert('ファイルサイズが大きすぎるかも')
      }
      const outputFileName = `${nanoid()}.mp4`
      const binaryData = new Uint8Array(await file.arrayBuffer());
      const video = await compressMp4Video(binaryData, file.name, outputFileName);
      const outputBlob = new Blob([video], { type: "video/mp4" });
      const objUrl = window.URL.createObjectURL(outputBlob);
      const link = document.createElement("a");
      link.href = objUrl;
      link.download = outputFileName;
      link.click();
    }
  };
  return (
    <chakra.div>
      <chakra.section>
        <chakra.h1>compress mp4 video using ffmpeg</chakra.h1>
        <chakra.p>スクリーンキャプチャで保存した動画を、githubに貼れるぐらいに圧縮してくれることを期待する君α</chakra.p>
        <chakra.p> ffmpeg -i input.mp4 -crf 23 output.mp4</chakra.p>
        <chakra.div w="100%" h="500px">
          <FileUploader handleChange={handleChange} name="file" types={fileTypes}/>
        </chakra.div>
      </chakra.section>
    </chakra.div>
  );
}

export default App;
