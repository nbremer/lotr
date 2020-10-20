/*
** Based on the d3v4 d3.chord() function by Mike Bostock
** Adjusted by Nadieh Bremer - July 2016
*/
function loom() {
	
  var pi$3 = Math.PI;
  var tau$3 = pi$3 * 2;
  var max$1 = Math.max;
	
  var padAngle = 0,
      sortGroups = null,
      sortSubgroups = null,
  	  sortStrings = null,
  	  heightInner = 20,
  	  widthOffsetInner = function() { return x; },
  	  emptyPerc = 0.2,
  	  value = function(d) { return d; },
	  inner = function(d) { return d.source; },
  	  outer = function(d) { return d.target; };

  function loom(data) {
	  
	  //Nest the data on the outer variable
	  data = d3.nest().key(outer).entries(data);
	  
	  var n = data.length,
	  	groupSums = [],
        groupIndex = d3.range(n),
        subgroupIndex = [],
        looms = [],
        groups = looms.groups = new Array(n),
        subgroups,
		numSubGroups,
	  	uniqueInner = looms.innergroups = [],
	  	uniqueCheck = [],
	    emptyk,
        k,
        x,
        x0,
        dx,
        i,
        j,
	  	l,
	  	m,
	  	s,
	    v,
	    sum,
	  	counter,
		reverseOrder = false,
	    approxCenter;

	//Loop over the outer groups and sum the values
	k = 0;
	numSubGroups = 0;
	for(i = 0; i < n; i++) {
		v = data[i].values.length;
		sum = 0;
		for(j = 0; j < v; j++) {
			sum += value(data[i].values[j]);
		}//for j
		groupSums.push(sum);
		subgroupIndex.push(d3.range(v));
		numSubGroups += v;
		k += sum;	
	}//for i
	
    // Sort groups…
    if (sortGroups) groupIndex.sort(function(a, b) {
      return sortGroups(groupSums[a], groupSums[b]);
    });

    // Sort subgroups…
    if (sortSubgroups) subgroupIndex.forEach(function(d, i) {
      d.sort(function(a, b) {
        return sortSubgroups( inner(data[i].values[a]), inner(data[i].values[b]) );
      });
    });
				
	//After which group are we past the center
	//TODO: make something for if there is no nice split in two...
	l = 0;
	for(i = 0; i < n; i++) {
		l += groupSums[groupIndex[i]];
		if(l > k/2) {
			approxCenter = groupIndex[i];
			break;
		}//if
	}//for i
	
	//How much should be added to k to make the empty part emptyPerc big of the total
	emptyk = k * emptyPerc / (1 - emptyPerc);
	k += emptyk;

    // Convert the sum to scaling factor for [0, 2pi].
    k = max$1(0, tau$3 - padAngle * n) / k;
    dx = k ? padAngle : tau$3 / n;
  
    // Compute the start and end angle for each group and subgroup.
    // Note: Opera has a bug reordering object literal properties!
	subgroups = new Array(numSubGroups);
    x = emptyk * 0.25 * k; //quarter of the empty part //0;
	counter = 0;
	for(i = 0; i < n; i++) {
		var di = groupIndex[i],
			outername = data[di].key;
		
		if(approxCenter === di) { 
			x = x + emptyk * 0.5 * k; 
		}//if
		x0 = x;
		//If you've crossed the bottom, reverse the order of the inner strings
		if(x > pi$3) reverseOrder = true;
		s = subgroupIndex[di].length;
		for(j = 0; j < s; j++) {
            var dj = reverseOrder ? subgroupIndex[di][(s-1)-j] : subgroupIndex[di][j],
                v = value(data[di].values[dj]),
				innername = inner(data[di].values[dj]);
                a0 = x,
                a1 = x += v * k;
	        subgroups[counter] = {
	              index: di,
	              subindex: dj,
	              startAngle: a0,
	              endAngle: a1,
	              value: v,
				  outername: outername,
				  innername: innername
	        };
			
			//Check and save the unique inner names
		    if( !uniqueCheck[innername] ) {
		    	uniqueCheck[innername] = true;
		    	uniqueInner.push({name: innername});
			}//if
			
			counter += 1;
		}//for j
        groups[di] = {
            index: di,
            startAngle: x0,
            endAngle: x,
            value: groupSums[di],
			outername: outername
        };
        x += dx;		
	}//for i

	//Sort the inner groups in the same way as the strings
  	uniqueInner.sort(function(a, b) {
    	return sortSubgroups( a.name, b.name );
  	});
	//Find x and y locations of the inner categories
	//TODO: make x depend on length of inner name	
	m = uniqueInner.length
	for(i = 0; i < m; i++) {
		uniqueInner[i].x = 0;
		uniqueInner[i].y = -m*heightInner/2 + i*heightInner;
		uniqueInner[i].offset = widthOffsetInner(uniqueInner[i].name, i, uniqueInner);
	}//for i
  			
    //Generate bands for each (non-empty) subgroup-subgroup link
	counter = 0;
	for(i = 0; i < n; i++) {
		var di = groupIndex[i];
		s = subgroupIndex[di].length;
		for(j = 0; j < s; j++) {
			var outerGroup = subgroups[counter];
			var innerTerm = outerGroup.innername;
			//Find the correct inner object based on the name
			var innerGroup = searchTerm(innerTerm, "name", uniqueInner);
	            if (outerGroup.value) {
	              looms.push({inner: innerGroup, outer: outerGroup});
	            }//if
			counter +=1;
		}//for j
	}//for i

    return sortStrings ? looms.sort(sortStrings) : looms;
  };//function loom(matrix)

  function searchTerm(term, property, arrayToSearch){
	   for (var i=0; i < arrayToSearch.length; i++) {
	       if (arrayToSearch[i][property] === term) {
	           return arrayToSearch[i];
	       }//if
	   }//for i
  }//searchTerm

  function constant$11(x) {
      return function() { return x; };
  }//constant$11
  
  loom.padAngle = function(_) {
    return arguments.length ? (padAngle = max$1(0, _), loom) : padAngle;
  };

  loom.inner = function(_) {
    return arguments.length ? (inner = _, loom) : inner;
  };
  
  loom.outer = function(_) {
    return arguments.length ? (outer = _, loom) : outer;
  };
  
  loom.value = function(_) {
    return arguments.length ? (value = _, loom) : value;
  };
  
  loom.heightInner = function(_) {
    return arguments.length ? (heightInner = _, loom) : heightInner;
  };

  loom.widthOffsetInner = function(_) {
    return arguments.length ? (widthOffsetInner = typeof _ === "function" ? _ : constant$11(+_), loom) : widthOffsetInner;
  };
  
  loom.emptyPerc = function(_) {
    return arguments.length ? (emptyPerc = _ < 1 ? max$1(0, _) : max$1(0, _*0.01), loom) : emptyPerc;
  };
  
  loom.sortGroups = function(_) {
    return arguments.length ? (sortGroups = _, loom) : sortGroups;
  };

  loom.sortSubgroups = function(_) {
    return arguments.length ? (sortSubgroups = _, loom) : sortSubgroups;
  };

  loom.sortBands = function(_) {
    return arguments.length ? (_ == null ? sortBands = null : (sortBands = compareValue(_))._ = _, loom) : sortBands && sortBands._;
  };

  return loom;
  
}//loom