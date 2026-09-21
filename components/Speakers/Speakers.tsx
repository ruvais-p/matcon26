import React from "react";
import Image from "next/image";
import styles from "./Speakers.module.css";
import defaultSpeakersData from "@/data/speakers.json";
import { supabase } from "@/lib/supabase";

interface Speaker {
  id?: string;
  name: string;
  designation: string;
  department?: string;
  institution?: string;
  organization?: string;
  country?: string;
  image?: string;
}

async function getSpeakers(): Promise<Speaker[]> {
  try {
    const { data, error } = await supabase
      .from("speakers")
      .select("*")
      .order("order_index", { ascending: true })
      .order("created_at", { ascending: true });

    if (!error && data && data.length > 0) {
      return data as Speaker[];
    }
  } catch (err) {
    console.error("Error reading speakers from Supabase:", err);
  }
  return defaultSpeakersData as Speaker[];
}


const SpeakerCard: React.FC<{ speaker: Speaker }> = ({ speaker }) => {
  const org = speaker.organization || speaker.institution || "";
  const imagePath = speaker.image
    ? (speaker.image.startsWith("http") || speaker.image.startsWith("/")
        ? speaker.image
        : `/speakers/${speaker.image}`)
    : "/speakers/default.svg";

  return (
    <div className={styles.card_wrapper}>
      <div className={styles.card_main}>
        <div className={styles.image_container}>
          <Image
            src={imagePath}
            alt={speaker.name}
            width={300}
            height={300}
            className={styles.image}
            unoptimized={true}
          />
        </div>
      </div>

      <div className={styles.info}>
        <h3 className={styles.name}>{speaker.name}</h3>
        <p className={styles.designation}>{speaker.designation}</p>

        {speaker.department && (
          <p className={styles.department}>{speaker.department}</p>
        )}

        {org && (
          <p className={styles.institution}>
            {org}
            {speaker.country && (
              <>
                {", "}
                <span className={styles.country}>{speaker.country}</span>
              </>
            )}
          </p>
        )}
      </div>
    </div>
  );
};

export default async function Speakers() {
  const speakersData = await getSpeakers();

  return (
    <section className={styles.speakers}>
      <div className={styles.container}>
        <header className={styles.header}>
          <span className={styles.meta}>03/08 // ACADEMIC_ELITE</span>
          <h2 className={styles.title}>DISTINGUISHED SPEAKERS</h2>
          <div className={styles.underline}></div>
        </header>

        <div className={styles.grid}>
          {speakersData.map((speaker, index) => (
            <SpeakerCard key={index} speaker={speaker} />
          ))}
        </div>
      </div>
    </section>
  );
}