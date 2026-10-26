"use client";

import { useState } from "react";
import Image from "next/image";
import styles from "./Speakers.module.css";

interface SpeakerImageProps {
  src: string;
  name: string;
}

export default function SpeakerImage({ src, name }: SpeakerImageProps) {
  const [imgSrc, setImgSrc] = useState(src);

  return (
    <Image
      src={imgSrc}
      alt={name}
      width={300}
      height={300}
      className={styles.image}
      unoptimized={true}
      onError={() => {
        if (imgSrc !== "/speakers/default.svg") {
          setImgSrc("/speakers/default.svg");
        }
      }}
    />
  );
}
