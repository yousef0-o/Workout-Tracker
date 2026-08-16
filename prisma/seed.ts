import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const seedExercises = [
  // CHEST
  {
    name: 'Barbell Bench Press',
    description: 'Compound upper-body exercise that targets the pectoralis major, anterior deltoids, and triceps brachii using a barbell on a flat bench.',
    category: 'STRENGTH',
    muscleGroup: 'CHEST',
    equipment: 'BARBELL',
  },
  {
    name: 'Incline Dumbbell Press',
    description: 'Upper chest focused pressing movement on an incline bench (30-45 degrees) that emphasizes clavicular head of the pectorals.',
    category: 'STRENGTH',
    muscleGroup: 'CHEST',
    equipment: 'DUMBBELL',
  },
  {
    name: 'Push-Ups',
    description: 'Classic calisthenic bodyweight movement targeting chest, shoulders, triceps, and core stability.',
    category: 'CALISTHENICS',
    muscleGroup: 'CHEST',
    equipment: 'BODYWEIGHT',
  },
  {
    name: 'Cable Chest Fly',
    description: 'Isolation exercise maintaining constant tension on the pectoral muscles across the horizontal adduction range of motion.',
    category: 'STRENGTH',
    muscleGroup: 'CHEST',
    equipment: 'CABLE',
  },
  {
    name: 'Chest Dips',
    description: 'Compound bodyweight exercise leaning slightly forward to place high mechanical tension on the lower chest and triceps.',
    category: 'CALISTHENICS',
    muscleGroup: 'CHEST',
    equipment: 'BODYWEIGHT',
  },

  // BACK
  {
    name: 'Conventional Deadlift',
    description: 'Full-body posterior chain compound lift strengthening the spinal erectors, glutes, hamstrings, lats, and trapezius.',
    category: 'STRENGTH',
    muscleGroup: 'BACK',
    equipment: 'BARBELL',
  },
  {
    name: 'Pull-Ups',
    description: 'Upper body vertical pulling exercise targeting the latissimus dorsi, rhomboids, and biceps with an overhand grip.',
    category: 'CALISTHENICS',
    muscleGroup: 'BACK',
    equipment: 'BODYWEIGHT',
  },
  {
    name: 'Barbell Bent-Over Row',
    description: 'Horizontal pull targeting mid-back thickness, latissimus dorsi, and rear deltoids while maintaining a hinged hip position.',
    category: 'STRENGTH',
    muscleGroup: 'BACK',
    equipment: 'BARBELL',
  },
  {
    name: 'Lat Pulldown',
    description: 'Cable machine vertical pull targeting latissimus dorsi and assisting scapular retraction.',
    category: 'STRENGTH',
    muscleGroup: 'BACK',
    equipment: 'CABLE',
  },
  {
    name: 'Seated Cable Row',
    description: 'Cable horizontal pulling exercise focusing on mid-back, rhomboids, lower traps, and biceps.',
    category: 'STRENGTH',
    muscleGroup: 'BACK',
    equipment: 'CABLE',
  },

  // LEGS
  {
    name: 'Barbell Back Squat',
    description: 'The king of lower body exercises targeting quadriceps, glutes, hamstrings, calves, and core stabilization.',
    category: 'STRENGTH',
    muscleGroup: 'LEGS',
    equipment: 'BARBELL',
  },
  {
    name: 'Romanian Deadlift',
    description: 'Hip hinge movement emphasizing hamstring flexibility and eccentric strength, glutes, and lower back.',
    category: 'STRENGTH',
    muscleGroup: 'LEGS',
    equipment: 'BARBELL',
  },
  {
    name: 'Leg Press',
    description: 'Machine compound exercise targeting quadriceps and glutes while minimizing lower back spinal loading.',
    category: 'STRENGTH',
    muscleGroup: 'LEGS',
    equipment: 'MACHINE',
  },
  {
    name: 'Walking Lunges',
    description: 'Unilateral leg movement building balance, single-leg stability, glute activation, and quad strength.',
    category: 'STRENGTH',
    muscleGroup: 'LEGS',
    equipment: 'DUMBBELL',
  },
  {
    name: 'Lying Leg Curl',
    description: 'Direct isolation exercise focusing strictly on hamstring knee flexion.',
    category: 'STRENGTH',
    muscleGroup: 'LEGS',
    equipment: 'MACHINE',
  },
  {
    name: 'Standing Calf Raise',
    description: 'Calf exercise isolating the gastrocnemius muscle through plantar flexion.',
    category: 'STRENGTH',
    muscleGroup: 'LEGS',
    equipment: 'MACHINE',
  },

  // SHOULDERS
  {
    name: 'Overhead Barbell Press',
    description: 'Strict standing press building anterior/medial deltoid strength, triceps, upper chest, and core stabilization.',
    category: 'STRENGTH',
    muscleGroup: 'SHOULDERS',
    equipment: 'BARBELL',
  },
  {
    name: 'Dumbbell Lateral Raise',
    description: 'Isolation exercise targeting the lateral head of the deltoid for broader shoulders and shoulder cap development.',
    category: 'STRENGTH',
    muscleGroup: 'SHOULDERS',
    equipment: 'DUMBBELL',
  },
  {
    name: 'Face Pull',
    description: 'Rotational cable exercise strengthening the rear delts, rotator cuff, and rhomboids to promote shoulder health.',
    category: 'STRENGTH',
    muscleGroup: 'SHOULDERS',
    equipment: 'CABLE',
  },
  {
    name: 'Arnold Press',
    description: 'Rotational dumbbell overhead press targeting all three heads of the deltoid throughout the movement.',
    category: 'STRENGTH',
    muscleGroup: 'SHOULDERS',
    equipment: 'DUMBBELL',
  },

  // ARMS
  {
    name: 'Barbell Bicep Curl',
    description: 'Classic bicep mass builder targeting both the long and short heads of the biceps brachii.',
    category: 'STRENGTH',
    muscleGroup: 'ARMS',
    equipment: 'BARBELL',
  },
  {
    name: 'Hammer Curl',
    description: 'Neutral-grip dumbbell curl targeting the brachialis and brachioradialis for forearm and arm thickness.',
    category: 'STRENGTH',
    muscleGroup: 'ARMS',
    equipment: 'DUMBBELL',
  },
  {
    name: 'Tricep Rope Pushdown',
    description: 'Cable isolation exercise targeting the lateral and medial heads of the triceps with full lockout.',
    category: 'STRENGTH',
    muscleGroup: 'ARMS',
    equipment: 'CABLE',
  },
  {
    name: 'Skull Crushers',
    description: 'Lying triceps extension using an EZ-bar to place high stretch on the long head of the triceps.',
    category: 'STRENGTH',
    muscleGroup: 'ARMS',
    equipment: 'BARBELL',
  },

  // CORE
  {
    name: 'Plank',
    description: 'Isometric core hold building endurance and stability in the rectus abdominis, obliques, and transverse abdominis.',
    category: 'CALISTHENICS',
    muscleGroup: 'CORE',
    equipment: 'BODYWEIGHT',
  },
  {
    name: 'Hanging Leg Raise',
    description: 'Dynamic abdominal exercise targeting lower abs, hip flexors, and grip strength.',
    category: 'CALISTHENICS',
    muscleGroup: 'CORE',
    equipment: 'BODYWEIGHT',
  },
  {
    name: 'Russian Twists',
    description: 'Rotational abdominal movement targeting the internal and external obliques and core rotation power.',
    category: 'CALISTHENICS',
    muscleGroup: 'CORE',
    equipment: 'BODYWEIGHT',
  },
  {
    name: 'Ab Wheel Rollout',
    description: 'Advanced anti-extension core exercise requiring tremendous abdominal control and upper-body stability.',
    category: 'CALISTHENICS',
    muscleGroup: 'CORE',
    equipment: 'OTHER',
  },

  // CARDIO & HIIT
  {
    name: 'Treadmill Running',
    description: 'Cardiovascular aerobic exercise enhancing VO2 max, stamina, and caloric expenditure.',
    category: 'CARDIO',
    muscleGroup: 'FULL_BODY',
    equipment: 'MACHINE',
  },
  {
    name: 'Rowing Machine',
    description: 'Full-body cardiovascular and muscular endurance exercise engaging legs, back, arms, and core.',
    category: 'CARDIO',
    muscleGroup: 'FULL_BODY',
    equipment: 'MACHINE',
  },
  {
    name: 'Kettlebell Swings',
    description: 'Dynamic ballistic exercise targeting the posterior chain, glutes, hamstrings, and cardiovascular endurance.',
    category: 'HIIT',
    muscleGroup: 'FULL_BODY',
    equipment: 'KETTLEBELL',
  },
  {
    name: 'Burpees',
    description: 'Full body high-intensity calisthenic movement combining squat, plank, pushup, and jump.',
    category: 'HIIT',
    muscleGroup: 'FULL_BODY',
    equipment: 'BODYWEIGHT',
  },
  {
    name: 'Jump Rope',
    description: 'Cardio coordination workout improving foot speed, calf endurance, and aerobic conditioning.',
    category: 'CARDIO',
    muscleGroup: 'LEGS',
    equipment: 'OTHER',
  },

  // FLEXIBILITY
  {
    name: 'Pigeon Pose',
    description: 'Deep yoga hip opener stretching the gluteus medius, piriformis, and hip flexors.',
    category: 'FLEXIBILITY',
    muscleGroup: 'LEGS',
    equipment: 'BODYWEIGHT',
  },
  {
    name: 'Cobra Pose',
    description: 'Gentle spinal extension stretching the chest, shoulders, and abdomen while strengthening spine erectors.',
    category: 'FLEXIBILITY',
    muscleGroup: 'BACK',
    equipment: 'BODYWEIGHT',
  },
  {
    name: 'World\'s Greatest Stretch',
    description: 'Comprehensive multi-joint dynamic mobility exercise hitting hips, thoracic spine, hamstrings, and groin.',
    category: 'FLEXIBILITY',
    muscleGroup: 'FULL_BODY',
    equipment: 'BODYWEIGHT',
  },
];

export async function seed() {
  console.log('🌱 Starting exercise database seeding...');

  let count = 0;
  for (const exercise of seedExercises) {
    await prisma.exercise.upsert({
      where: { name: exercise.name },
      update: {
        description: exercise.description,
        category: exercise.category,
        muscleGroup: exercise.muscleGroup,
        equipment: exercise.equipment,
      },
      create: {
        name: exercise.name,
        description: exercise.description,
        category: exercise.category,
        muscleGroup: exercise.muscleGroup,
        equipment: exercise.equipment,
        isCustom: false,
      },
    });
    count++;
  }

  console.log(`✅ Successfully seeded ${count} exercises.`);
}

if (require.main === module) {
  seed()
    .catch((e) => {
      console.error('❌ Error during seeding:', e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
