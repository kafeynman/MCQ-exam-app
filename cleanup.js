
const fs = require('fs');
const path = require('path');

const inputFile = 'question_bank_v22.json'; // The input file with the old format
const outputFile = 'question_bank.json';   // The output file for the app

console.log(`Starting conversion of ${inputFile}...`);

// 1. Read the input file
fs.readFile(path.join(__dirname, inputFile), 'utf8', (err, data) => {
    if (err) {
        console.error(`Error: Could not read the input file '${inputFile}'. Make sure it exists in the same directory.`);
        console.error(err);
        return;
    }

    try {
        const v22_data = JSON.parse(data);

        // 2. Transform the data
        const transformedData = {
            metadata: {
                total_questions: v22_data.questions.length, // Recalculate just in case
                difficulty_distribution: v22_data.metadata.difficulty_distribution,
            },
            questions: v22_data.questions.map(q => {
                const spanTagRegex = /\[span_\d+\]\((start_span|end_span)\)/g;

                return {
                    id: q.id,
                    bok_reference: q.bok_reference,
                    difficulty: q.difficulty,
                    question_text: q.question_text,
                    options: q.options,
                    correct_answer: q.correct_answer,
                    solution: {
                        correct_rationale: q.solution.correct_rationale.replace(spanTagRegex, '').trim(),
                        distractor_analysis: q.solution.distractor_analysis.replace(spanTagRegex, '').trim(),
                    }
                };
            })
        };
        
        // Recalculate difficulty distribution
        const newDistribution = { Easy: 0, Medium: 0, Hard: 0 };
        transformedData.questions.forEach(q => {
            if (q.difficulty in newDistribution) {
                newDistribution[q.difficulty]++;
            }
        });
        transformedData.metadata.difficulty_distribution = newDistribution;


        // 3. Write the new file
        fs.writeFile(path.join(__dirname, outputFile), JSON.stringify(transformedData, null, 2), 'utf8', (writeErr) => {
            if (writeErr) {
                console.error(`Error writing the output file '${outputFile}':`, writeErr);
                return;
            }
            console.log(`Successfully converted ${inputFile} to ${outputFile}!`);
            console.log(`Total questions processed: ${transformedData.metadata.total_questions}`);
        });

    } catch (parseError) {
        console.error(`Error: Failed to parse JSON from '${inputFile}'. Please ensure it is a valid JSON file.`);
        console.error(parseError);
    }
});
