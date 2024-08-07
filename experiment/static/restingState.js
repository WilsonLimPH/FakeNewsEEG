// Parameters Customization
// ==========================
// To change the parameters, make sure you are editing the file locally
// (you need to download the repository)
// Change what you want, save and run your local index.html

// experiment version
version = "1.0"
// Resting state duration in min
duration = 8
// [x, y, width, height] in pixels. Set to [0, 0, 0, 0] to disable.
marker_position = [0, 50, 100, 150]
// Are all the questions from the debriefing required?
questions_required = false
// Record webcam?
record_webcam = false
// Display raw data at the end
raw_data = false
// Debriefing questionnaire
var items = [
    "I had busy thoughts",
    "I had rapidly switching thoughts",
    "I had difficulty holding onto my thoughts",
    "I thought about others",
    "I thought about people I like",
    "I placed myself in other people's shoes",
    "I thought about my feelings",
    "I thought about my behaviour",
    "I thought about myself",
    "I thought about things I need to do",
    "I thought about solving problems",
    "I thought about the future",
    "I felt sleepy",
    "I felt tired",
    "I had difficulty staying awake",
    "I felt comfortable",
    "I felt happy",
    "I felt relaxed",
    "I was conscious of my body",
    "I thought about my heartbeat",
    "I thought about my breathing",
    // "I felt ill",
    // "I thought about my health",
    // "I felt pain",
    // "I thought in images",
    // "I pictured events",
    // "I pictured places",
    // "I thought in words",
    // "I had silent conversations",
    // "I imagined talking to myself",
]
var dimensions = [
    "DoM_1",
    "DoM_2",
    "DoM_3",
    "ToM_1",
    "ToM_2",
    "ToM_3",
    "Self_1",
    "Self_2",
    "Self_3",
    "Plan_1",
    "Plan_2",
    "Plan_3",
    "Sleep_1",
    "Sleep_2",
    "Sleep_3",
    "Comfort_1",
    "Comfort_2",
    "Comfort_3",
    "SomA_1",
    "SomA_2",
    "SomA_3",
    // "Health_1", "Health_2", "Health_3",
    // "Visual_1", "Visual_2", "Visual_3",
    // "Verbal_1", "Verbal_2", "Verbal_3",
]

var check_items = [
    "I had my eyes closed",
    "I was able to rate the statements above",
]

var eye_calibration_instructions = {
    type: jsPsychHtmlButtonResponse,
    stimulus:
        "<p><b>Instructions</b></p>" +
        // Don't give exact time so that participants don't count
        "<p><b>DO NOT PROCEED UNTIL INSTRUCTED BY THE EXPERIMENTER!</b></p>" +
        "<p>We will first conduct a preliminary eye-tracking calibration before proceeding. Please follow the experimenter's instructions.</p>",
    choices: ["Continue"],
}

var RS_instructions = {
    type: jsPsychHtmlButtonResponse,
    stimulus:
        "<p><b>Instructions</b></p>" +
        // Don't give exact time so that participants don't count
        "<p><b>DO NOT PROCEED UNTIL INSTRUCTED BY THE EXPERIMENTER!</b></p>" +
        "<p>A rest period of approximately 10 minutes is about to start.</p>" +
        "<p>Simply <b>relax</b> and remain seated quietly with your eyes closed. Please try <b>not to fall asleep</b>.</p> " +
        "<p>Once the resting period is over, you will hear a beep. You can then open your eyes and proceed.</p>" +
        "<p>Once you are ready, close your eyes. The rest period will shortly begin.</p>",
    choices: ["Continue"],
}

if (record_webcam) {
    var extensions = [{ type: jsPsychExtensionRecordVideo }]
} else {
    var extensions = []
}

// Functions ===================================================================
function create_marker(marker_position, color = "black") {
    const html = `<div id="marker" style="position: absolute; background-color: ${color};\
left:${marker_position[0]}px; top:${marker_position[1]}px; \
width:${marker_position[2]}px; height:${marker_position[3]}px";></div>`
    document.querySelector("body").insertAdjacentHTML("beforeend", html)
}

// Tasks ======================================================================
// Create blank grey screen just before rest period
var RS_buffer = {
    type: jsPsychHtmlKeyboardResponse,
    on_start: function () {
        document.body.style.backgroundColor = "#808080"
        document.body.style.cursor = "none"
        create_marker(marker_position, (color = "white"))
    },
    on_finish: function () {
        document.querySelector("#marker").remove()
    },
    stimulus: "",
    choices: ["s"],
    trial_duration: 1000, // 1 second
    css_classes: ["fixation"],
}

// Create blank grey screen for resting state
var RS_task = {
    type: jsPsychHtmlKeyboardResponse,
    extensions: extensions,
    on_load: function () {
        create_marker(marker_position)
    },
    stimulus: "<p style='font-size:150px;'>+</p>",
    choices: ["s"],
    trial_duration: duration * 60 * 1000,
    css_classes: ["fixation"],
    data: {
        screen: "resting",
        time_start: function () {
            return performance.now()
        },
    },
    on_finish: function (data) {
        document.querySelector("#marker").remove()
        data.duration = (performance.now() - data.time_start) / 1000 / 60
    },
}

// Play beep
var RS_beep = {
    type: jsPsychAudioButtonResponse,
    on_start: function () {
        document.body.style.backgroundColor = "#FFFFFF"
        document.body.style.cursor = "auto"
    },
    stimulus: ["/static/utils/beep.mp3"],
    prompt: "<p>It's over! Please press continue.</p>",
    choices: ["Continue"],
}
// Debriefing Questionnaire ========================================================================

var scale = ["Completely Disagree", "Completely Agree"]

// Create list of formatted questions into the list
var questions = []
for (const [index, element] of items.entries()) {
    questions.push({
        prompt: "<b>" + element + "</b>",
        name: dimensions[index],
        ticks: scale,
        required: questions_required,
        min: 0,
        max: 1,
        step: 0.01,
        slider_start: 0.5,
    })
}
// Randomize order (comment this out to deactivate the randomization)
questions = questions.sort(() => Math.random() - 0.5)

// Do the same for validation items to add them at the end (not randomized)
for (const [index, element] of check_items.entries()) {
    questions.push({
        prompt: "<b>" + element + "</b>",
        name: "Check_" + (index + 1),
        ticks: scale,
        required: questions_required,
        min: 0,
        max: 1,
        step: 0.01,
        slider_start: 0.5,
    })
}

// Make questionnaire task
var RS_questionnaire = {
    type: jsPsychMultipleSlider, // this is a custom plugin in utils
    questions: questions,
    randomize_question_order: false,
    preamble:
        "<p><b>A few questions...</b></p>" +
        "<p>We are interested in the potential feelings and thoughts you may have experienced during the resting period.</p>" +
        "<p>Please indicate the extent to which you agree with each statement.</p><br/> ",
    require_movement: questions_required,
    slider_width: null,
    data: {
        screen: "questionnaire_restingstate",
    },
}
