function TeamScore(teamIndex) {
	this.index = teamIndex;
	this.bids = ko.observable(0); // TODO: track bids for each player?
	this.tricks = ko.observable(0);
	this.score = ko.computed(function() {
		return this.tricks() + ((this.tricks() == this.bids()) ? 10 : 0)
	}, this);
}

function Round(previousRound, onEnd) {
	// what round number this is
	this.number = (previousRound ? previousRound.number : 1);

	// the previous round
	this.previousRound = previousRound;

	// an array of team score records for this round
	this.roundScore = [new TeamScore(0), new TeamScore(1)]; 

	// an array of team total scores
	this.gameScore = [
		ko.computed(function() { return this.roundScore[0].score() + ((this.previousRound) ? this.previousRound.roundScore[0].score() : 0); }, this),
		ko.computed(function() { return this.roundScore[1].score() + ((this.previousRound) ? this.previousRound.roundScore[1].score() : 0); }, this),
	];

	this.stage = ko.observable('bidding');

	this.onEnd = onEnd;
}

Round.prototype.endBidding = function() {
	this.stage('playing');
};

Round.prototype.endRound = function() {
	this.stage('complete');
	var onEnd = this.onEnd;
	onEnd(this);
}

function ViewModel() {
	this.currentRound = ko.observable();
	this.currentScore = [
		(this.currentRound() ? this.currentRound().gameScore[0]() : 0),
		(this.currentRound() ? this.currentRound().gameScore[1]() : 0),
	];

	this.lastRound = ko.computed(function() {
		var round = this.currentRound();
		while (round && round.stage() != 'complete')
			round = round.previousRound;
		return round;
	}, this);

	this.gameScore = [
		ko.computed(function() { return this.score(0); }, this),
		ko.computed(function() { return this.score(1); }, this),
	];

	this.mode = ko.computed(function() {
		if (!this.currentRound())
			return 'uninitialized';
		return this.currentRound().stage();
	}, this);

	this.newGame();
}

ViewModel.prototype.score = function(teamIndex) {
	if (!this.lastRound())
		return 0;
	return lastRound().gameScore[teamIndex]();
};

ViewModel.prototype.onRoundEnd = function(round) {
	var nextRound = new Round(round, this.onRoundEnd);
	this.currentRound(nextRound);
};

ViewModel.prototype.newGame = function() {
	var firstRound = new Round(null, this.onRoundEnd.bind(this));
	this.currentRound(firstRound);
};
