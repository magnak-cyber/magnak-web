import React from 'react';
import styles from './WorkStagesBlock.module.css';
import {useTranslation} from "@/hooks/useTranslation";

interface Stage {
  number: number;
  title: string;
  description: string;
}

export const WorkStagesBlock: React.FC = () => {
  const { t } = useTranslation();

  const stages: Stage[] = [
    {
      number: 1,
      title: 'home.stage1Title',
      description: 'home.stage1Description',
    },
    {
      number: 2,
      title: 'home.stage2Title',
      description: 'home.stage2Description',
    },
    {
      number: 3,
      title: 'home.stage3Title',
      description: 'home.stage3Description',
    },
    {
      number: 4,
      title: 'home.stage4Title',
      description: 'home.stage4Description',
    },
    {
      number: 5,
      title: 'home.stage5Title',
      description: 'home.stage5Description',
    },
  ];

  return (
    <section id={'work-stages'} className={styles.workStagesSection}>
      <h2 className={styles.sectionTitle}>{t('home.workStagesTitle')}</h2>
      <div className={styles.stagesContainer}>

        {stages.map((stage) => (
          <div key={stage.number} className={styles.stageBlock}>
            <div className={styles.stageNumber}>{stage.number}.</div>
            <h3 className={styles.stageTitle}>{t(stage.title)}</h3>
            <p className={styles.stageDescription}>{t(stage.description)}</p>
          </div>
        ))}
      </div>
    </section>
  );
};