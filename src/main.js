FIELD_SIZE = 6;
FIELD_PX = 650;

CELL_SIZE = FIELD_PX/FIELD_SIZE;

CellType = {
    FIELD : 0,
    MOUNTAIN : 1,
    RIVER : 2,
};

var WeatherMatrix = [
    [0, 0, 0, -1],
    [0, 1, 1, 0],
    [0, 1, 1, 1],
    [-1, 0, 1, 1]
];

function waitSeconds(iMilliSeconds) {
    var counter= 0
        , start = new Date().getTime()
        , end = 0;
    while (counter < iMilliSeconds) {
        end = new Date().getTime();
        counter = end - start;
    }
}

class Cell {
  constructor (type) {
      this.type = type;
      this.rain = 0;
      this.sun = 0;
      this.grass = 0;
  }

  update() {
      this.generate_sun();
      this.generate_rain();

      if (this.type == CellType.FIELD) {
          this.update_grass();
      }
  }

  initialize_neighbours(left, right, up, down) {
      this.is_near_river = (left && left.type == CellType.RIVER ||
        right && right.type == CellType.RIVER ||
        up && up.type == CellType.RIVER ||
        down && down.type == CellType.RIVER);
  }

  generate_sun() {
        this.sun = Math.floor(Math.random() * 4);
  }

  generate_rain() {
      this.rain = Math.floor(Math.random() * 4);
  }

  update_grass() {
        var new_grass = this.grass;

        if (this.is_near_river && this.sun > 0) {
            new_grass += 1;
        } else {
            new_grass += WeatherMatrix[this.sun][this.rain];
        }

        this.grass = Math.min(Math.max(new_grass, 0), 4);
  }

};

class Row {
    constructor(size) {
        this.generate_data(size);
    }

    generate_data(size) {
        this.cells = [];
        for (var i = 0; i < size; ++i) {
            this.cells.push(new Cell(this.generate_cell_type()));
        }
    }

    generate_cell_type() {
        return Math.floor(Math.random() * 3);
    }

    update() {
        for (var i = 0; i < this.cells.length; ++i) {
            this.cells[i].update();
        }
    }

    initialize_neighbours(up_neighbor, down_neighbor) {
        for (var i = 0; i < this.cells.length; ++i) {
            var left = (i > 0) ? this.cells[i - 1] : null;
            var right = (i < (this.cells.length - 1)) ? this.cells[i + 1] : null;
            var up = up_neighbor != null ? up_neighbor.cells[i] : null;
            var down = down_neighbor != null ? down_neighbor.cells[i] : null;

            this.cells[i].initialize_neighbours(left, right, up, down);
        }
    }
};

class Field {
    constructor(size) {
        this.generate_data(size);
        this.initialize_neighbours();
    }

    generate_data(size) {
        this.rows = [];
        for (var i = 0; i < size; ++i) {
            this.rows.push(new Row(size));
        }
    }

    initialize_neighbours() {
        for (var i = 0; i < this.rows.length; ++i) {
            var lhs = (i > 0) ? this.rows[i - 1] : null;
            var rhs = (i < (this.rows.length - 1)) ? this.rows[i + 1] : null;
            this.rows[i].initialize_neighbours(lhs, rhs);
        }
    }

    update() {
        for (var i = 0; i < this.rows.length; ++i) {
            this.rows[i].update();
        }
    }

    
    draw() {
      var field_table = $('#gameField')[0];
      var text_html = '';
        for (var a = 0; a < this.rows.length; a++) {
            text_html += "<tr>";
            for(var b = 0; b < this.rows[a].cells.length; b++) {
             text_html += "<td width='" + CELL_SIZE + "' height='" + CELL_SIZE + "' class='";
             var this_cell = this.rows[a].cells[b];

             text_html += get_type(this_cell.type);
             text_html += " grass" + this_cell.grass;
             text_html += "'>";
             if ( this_cell.type == CellType.FIELD ) {
               text_html += "<img src='sun.png' class='sun" + this_cell.sun + "'>";
               text_html += "<img src='drop.png' class='rain" + this_cell.rain + "'>";
            }
             text_html += "</td>";
          }
          text_html += "</tr>";  
        }
        field_table.innerHTML = text_html;
    }
};

function get_type(cell_type)
{
  if ( cell_type == CellType.FIELD ) {
    return " mud ";
  } 
  if ( cell_type == CellType.MOUNTAIN ) {
    return ' hill ';
  }
  return ' water ';
}

$(document).ready(function() {
  field = new Field(FIELD_SIZE);
  field.draw();
  });

document.onkeypress = function(e) {
  field.update();
  field.draw();
};