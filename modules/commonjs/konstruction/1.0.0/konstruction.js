// 
//  konstruction.js
//  ROK
//  
//  Created by S.Barker on 2021-03-22.
//  Copyright 2021 S.Barker. All rights reserved.
// 

function Konstruction(platform) {
    this.platform = platform;
}
 
// Public functions
// ================

Konstruction.prototype.platform = function() {
    return this.platform;
};
 
// Returns everything. 
module.exports = Konstruction;
