console.log("evaluate.js has been loaded");

//Create array to hold object data
var members = [];
var sumCompression = 0;
var countCompression = 0;
var sumTension = 0;
var countTension = 0;
var countCarbonSteelBeams = 0;

function createMember(row) {
    var fields = row.split("\t");
    console.log(fields);
    var member = {
        id: fields[0],
        material: fields[1],
        cross: fields[2],
        size: fields[3],
        length: fields[4],
        compressionForce: fields[5],
        compressionStrength: fields[6],
        compressionStatus: fields[7],
        tensionForce: fields[8],
        tensionStrength: fields[9],
        tensionStatus: fields[10],
        compressionRatio: (fields[5] / fields[6]),
        tensionRatio: (fields[8] / fields[9])
    };
    members.push(member);
}

function extractData(member) {
    if (member.compressionStatus == "Fail" || member.tensionStatus == "Fail") {
        throw new Error("A member has failed, results not calculated.")
    }

    if (member.compressionRatio != 0) {
        sumCompression += member.compressionRatio;
        countCompression++
    }

    if (member.tensionRatio != 0) {
        sumTension += member.tensionRatio
        countTension++
    }
    
    if(member.material == "CS") {
        countCarbonSteelBeams++;
    }
}

$(function() {
    //Listen for button click
    $('#btn-evaluate').on('click', function() {
        //Reset hidden alerts from previous submission
        $('#hidden-danger-alert').addClass('d-none');
        $('#hidden-danger-alert').text("");
        $('#hidden-success-alert').addClass('d-none');
        $('#hidden-success-alert').text("");

        //Get data from form
        var teamName = $('#input-team-name').val();
        var inputData = $.trim($('#input-results').val());

        //Check data exists
        if(teamName.length == 0){
            $('#hidden-danger-alert').append("Team name not provided");
            $('#hidden-danger-alert').removeClass('d-none');
            throw new Error("Team name not provided.")
        }
        if(inputData.length == 0){
            $('#hidden-danger-alert').append("Input data not provided");
            $('#hidden-danger-alert').removeClass('d-none');
            throw new Error("Input data not provided.")
        }

        //Log data from form
        console.log("Team Name: " + teamName);

        //Split on row
        try {
            var rows = inputData.split("\n");
        } catch (err) {
            $('#hidden-danger-alert').append(err);
            $('#hidden-danger-alert').removeClass('d-none');
            throw err;
        }
        
        //Remove header data, and column names
        console.log("Removed row: " + rows.shift());
        console.log("Removed row: " + rows.shift());
        console.log("Removed row: " + rows.shift());
        console.log("Removed row: " + rows.shift());
        
        try {
            //Create the members array
            rows.forEach(createMember);
            //Extract data we care about
            members.forEach(extractData);
        } catch (err) {
            $('#hidden-danger-alert').append(err);
            $('#hidden-danger-alert').removeClass('d-none');
            throw err;
        }

        //Calculate averages
        averageCompressionRatio = sumCompression/countCompression;
        averageTensionRatio = sumTension/countTension;

        //Log interested data
        console.log("Average Compression Ratio: " + averageCompressionRatio);
        console.log("Average Tension Ratio: " + averageTensionRatio);
        console.log("Carbon Steel Beams: " + countCarbonSteelBeams);

        //Calculate Grades
        //Compression Grade
        var compressionGrade = averageCompressionRatio <= 0.4 
            ? "A" : averageCompressionRatio <= 0.6 
            ? "B" : "C"
        //Tension Grade
        var tensionGrade = averageTensionRatio <= 0.4 
            ? "A" : averageTensionRatio <= 0.6 
            ? "B" : "C"
        //Final Score
        var finalScore = (averageCompressionRatio * 1000 + averageTensionRatio * 1000) * (1 + 0.1 * countCarbonSteelBeams)
        
        //Output to website
        $('#hidden-success-alert').append(
            "<p><strong>" + teamName + "</strong> Team Results:</p>" 
            + "<p>Compression Grade: " +  compressionGrade + "</p>"
            + "<p>Tension Grade: " +  tensionGrade + "</p>"
            + "<p>Final Score: " +  finalScore + "</p>"
            );
        $('#hidden-success-alert').removeClass('d-none');
      });
})
