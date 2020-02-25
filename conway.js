/*
    1. Any live cell with fewer than two live neighbors dies, as if by under population.
    2. Any live cell with two or three live neighbors lives on to the next generation.
    3. Any live cell with more than three live neighbors dies, as if by overpopulation.
    4. Any dead cell with exactly three live neighbors becomes a live cell, as if by reproduction.
*/
var NOTE_LENGTH = 250;


var oscillators = [];
var vcas = [];

var grid = [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
];

var nextGrid = [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
];

var cMajorScaleFrequencies = [
    261.63, // C4
    293.66, // D4
    329.63, // E4
    349.23, // F4
    392.00, // G4
    440.00, // A4
    493.88, // B4
    523.25 // C5
];
cMajorScaleFrequencies.reverse();


function generateGrid() {
    window.context = new AudioContext;
    var $row, vco, vca;
    for (var rows = 0; rows < 8; rows++) {
        
        vco = context.createOscillator();
        vco.type = 'triangle';
        vco.frequency.value = cMajorScaleFrequencies[rows];
        oscillators.push(vco);
        
        vca = context.createGain();
        vca.gain.value = 0;
        vco.start(0);
        vcas.push(vca);
        
        // connect vco to vca
        vco.connect(vca);
        vca.connect(context.destination);
        
        $row = $('<div class="row"></div>').appendTo('#grid');
        for (var columns = 0; columns < 8; columns++) {
            $row.append('<div class="cell"></div>');
        };
    };
}

function paintGrid() { 
    var y = 0;
    $('#grid').find('.row').each(function() {
        var x = 0;
        $(this).find('.cell').each(function() {
            x++;
            if(grid[y][x]) {
                $(this).addClass('on');
            } else {
                $(this).removeClass('on');
            }
        });
        y++;
    });
}

function generateSeed() {
    // generate initial pattern
    var x, y;
    for(y = 0; y < 8; y++) {
        for(x = 0; x < 8; x++) {
            grid[y][x] = (Math.random() >= 0.5);
        }
    }  
    paintGrid();
}

function doGeneration() {
    var neighbours ;
    for(y = 0; y < 8; y++) {
        for(x = 0; x < 8; x++) {
            
            // count neighbours
            neighbours = 0;
            
            // left
            if(x > 0 && grid[y][x - 1]) neighbours++; 
            
            // right
            if(x < 7 && grid[y][x + 1]) neighbours++;
            
            // up
            if(y > 0 && grid[y - 1][x]) neighbours++; 
            
            // down
            if(y < 7 && grid[y + 1][x]) neighbours++; 
            
            // top left
            if(x > 0 && y > 0 && grid[y - 1][x - 1]) neighbours++;
            
            // bottom left
            if(x > 0 && y < 7  && grid[y + 1][x - 1]) neighbours++;
            
            // top right
            if(x < 7 && y > 0  && grid[y - 1][x + 1]) neighbours++;
            
            // bottom right
            if(x < 7 && y < 7  && grid[y + 1][x + 1]) neighbours++;
            
            
            if(grid[y][x]) {
                // live cell
                if(neighbours < 2) {
                    // dies (under population)
                    nextGrid[y][x] = 0;
                } else if(neighbours < 4) {
                    // lives
                    nextGrid[y][x] = 1;
                } else {
                    // dies (overpopulation)
                    nextGrid[y][x] = 0;
                }
            } else {
                // dead cell
                if(neighbours == 3) {
                    nextGrid[y][x] = 1;
                } else {
                    nextGrid[y][x] = 0;
                }
            }
        }
    }    
    grid = nextGrid;
    
    // paint grid
    paintGrid();
}

function play() {
    var x = 0;
    if(window.interval) {
        clearInterval(interval);
    }
    window.interval = setInterval(function() {
        if(x < 7) {
            x++;
        } else {
            x = 0;
            doGeneration();
        }
        
        for(y = 0; y < 8; y++) {
            if(grid[y][x]) {
                //cas[y].gain.value = 0.1;
                vcas[y].gain.linearRampToValueAtTime(0.1, context.currentTime + 0.1);
            } else {
                //vcas[y].gain.value = 0;
                vcas[y].gain.linearRampToValueAtTime(0.0, context.currentTime + 0.1);
            }
        }    

    }, NOTE_LENGTH);
}


$(function() {

    $('#start').click(function() {
        $('#start').hide();
        $('#go').show();
        generateGrid();
    });

    $('#go').click(function() {
        generateSeed();
        doGeneration();  
        play();        
    });

});





